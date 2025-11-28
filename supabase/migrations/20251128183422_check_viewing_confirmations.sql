-- Database function to check viewing confirmations and update statuses
-- This function should be run periodically (e.g., via a cron job or manual trigger)

CREATE OR REPLACE FUNCTION check_viewing_confirmations()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark as DISPUTED if only one party confirmed after 72 hours
  UPDATE viewing_requests
  SET 
    status = 'disputed',
    updated_at = NOW()
  WHERE 
    status = 'scheduled'
    AND scheduled_date < (NOW() - INTERVAL '72 hours')
    AND (
      (tenant_confirmed = true AND landlord_confirmed = false)
      OR
      (tenant_confirmed = false AND landlord_confirmed = true)
    );

  -- Mark as EXPIRED if neither party confirmed after 72 hours
  UPDATE viewing_requests
  SET 
    status = 'expired',
    updated_at = NOW()
  WHERE 
    status = 'scheduled'
    AND scheduled_date < (NOW() - INTERVAL '72 hours')
    AND (tenant_confirmed = false OR tenant_confirmed IS NULL)
    AND (landlord_confirmed = false OR landlord_confirmed IS NULL);

  -- Mark as COMPLETED if both parties confirmed
  UPDATE viewing_requests
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE 
    status = 'scheduled'
    AND tenant_confirmed = true
    AND landlord_confirmed = true;

END;
$$;

-- Create a function to handle payment release when both parties confirm
CREATE OR REPLACE FUNCTION auto_release_payment_on_confirmation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  transaction_record RECORD;
BEGIN
  -- Check if both parties have confirmed
  IF NEW.tenant_confirmed = true AND NEW.landlord_confirmed = true THEN
    -- Update viewing request status to completed
    NEW.status := 'completed';
    
    -- Get the associated transaction
    SELECT * INTO transaction_record
    FROM transactions
    WHERE viewing_request_id = NEW.id;
    
    -- Update transaction escrow status to released
    IF transaction_record.id IS NOT NULL THEN
      UPDATE transactions
      SET 
        escrow_status = 'released',
        updated_at = NOW()
      WHERE id = transaction_record.id;
      
      -- Create payout record
      INSERT INTO payouts (
        transaction_id,
        landlord_id,
        amount,
        payout_method,
        payout_provider,
        payout_account,
        status,
        created_at
      )
      SELECT 
        transaction_record.id,
        NEW.landlord_id,
        transaction_record.amount,
        p.payout_method,
        p.payout_provider,
        p.payout_account_number,
        'pending',
        NOW()
      FROM profiles p
      WHERE p.id = NEW.landlord_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto payment release
DROP TRIGGER IF EXISTS trigger_auto_release_payment ON viewing_requests;
CREATE TRIGGER trigger_auto_release_payment
BEFORE UPDATE ON viewing_requests
FOR EACH ROW
EXECUTE FUNCTION auto_release_payment_on_confirmation();

-- Function to process refund (when landlord cancels or tenant no-show is disputed)
CREATE OR REPLACE FUNCTION process_refund(
  p_viewing_request_id UUID,
  p_refund_reason TEXT,
  p_refund_amount DECIMAL DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  v_transaction_id UUID;
  v_full_amount DECIMAL;
  v_refund_amount DECIMAL;
  v_result json;
BEGIN
  -- Get transaction details
  SELECT id, amount INTO v_transaction_id, v_full_amount
  FROM transactions
  WHERE viewing_request_id = p_viewing_request_id;
  
  IF v_transaction_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Transaction not found'
    );
  END IF;
  
  -- Determine refund amount (full refund if not specified)
  v_refund_amount := COALESCE(p_refund_amount, v_full_amount);
  
  -- Update transaction
  UPDATE transactions
  SET 
    escrow_status = CASE 
      WHEN v_refund_amount >= v_full_amount THEN 'refunded'
      ELSE 'partially_refunded'
    END,
    refund_amount = v_refund_amount,
    refund_reason = p_refund_reason,
    refunded_at = NOW(),
    updated_at = NOW()
  WHERE id = v_transaction_id;
  
  -- Update viewing request status
  UPDATE viewing_requests
  SET 
    status = CASE 
      WHEN status = 'cancelled_by_landlord' THEN 'cancelled_by_landlord'
      WHEN status = 'tenant_no_show' THEN 'tenant_no_show'
      ELSE 'cancelled_by_tenant'
    END,
    updated_at = NOW()
  WHERE id = p_viewing_request_id;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'refund_amount', v_refund_amount,
    'message', 'Refund processed successfully'
  );
END;
$$;

