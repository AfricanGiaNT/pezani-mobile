# Day 2 Testing Guide

**Last Updated:** November 27, 2025

This guide walks you through testing all Day 2 features.

---

## 🚀 Getting Started

### 1. Start Development Server

```bash
cd /Users/trevorchimtengo/Pezani-Mobile
npm run dev
```

Server should start at: `http://localhost:5174`

---

## 🧪 Testing Checklist

### Test 1: Design System Components ✅

**URL:** `http://localhost:5174/design-system`

**What to Test:**
- [ ] Button variants display (primary, secondary, outline, ghost, danger)
- [ ] Button sizes work (small, medium, large)
- [ ] Loading buttons show spinner
- [ ] Disabled buttons are not clickable
- [ ] Input fields show validation errors
- [ ] Cards render with shadows and hover effects
- [ ] Modal opens and closes smoothly
- [ ] All animations are smooth

**Expected Result:** All components display correctly with proper styling and animations.

---

### Test 2: Homepage ✅

**URL:** `http://localhost:5174`

**What to Test:**

#### Hero Section
- [ ] Large heading displays
- [ ] Search bar present
- [ ] Quick stats cards display (3 cards)
- [ ] Wave divider animation

#### Featured Properties
- [ ] Section title "Featured Properties"
- [ ] 6 property cards display
- [ ] Cards animate on scroll
- [ ] Heart icon for save functionality

#### Recent Properties
- [ ] Section title "Recent Listings"
- [ ] 8 property cards display
- [ ] Grid responsive (1 col mobile → 4 cols desktop)
- [ ] "Load More" button present

#### CTA Section
- [ ] Golden background
- [ ] "List Your Property" heading
- [ ] CTA button present

**Mobile Testing:**
- [ ] Resize to 375px width
- [ ] All sections stack vertically
- [ ] Cards display 1-2 per row
- [ ] Text readable, not too small
- [ ] Buttons tappable (min 44px)

---

### Test 3: Navigation ✅

**Desktop Navigation:**
- [ ] Logo on left
- [ ] Search bar in center
- [ ] "Browse Properties", "Login", "Sign Up" links on right
- [ ] All links navigate correctly
- [ ] Active link highlighted

**Mobile Navigation (<768px):**
- [ ] Hamburger menu icon visible
- [ ] Click opens drawer from right
- [ ] Navigation links in drawer
- [ ] Click link closes drawer
- [ ] Search bar visible in drawer

**Bottom Navigation (Mobile Only):**
- [ ] Only shows when logged in (test after login)
- [ ] Fixed at bottom
- [ ] 3 icons: Home, Search, Dashboard
- [ ] Active icon highlighted

**Footer:**
- [ ] Company info displays
- [ ] Quick links work
- [ ] Legal links present
- [ ] Contact information visible
- [ ] Responsive on mobile

---

### Test 4: Property Listing Form ✅

**URL:** `http://localhost:5174/properties/add`

**Note:** This is a protected route. You may need to login first (or bypass protection for testing).

#### Step 1: Basic Details
- [ ] Title input works
- [ ] Description textarea works (1500 char limit)
- [ ] Character counter updates
- [ ] Location dropdown shows 30 Malawi locations
- [ ] Validation errors show for empty fields
- [ ] Cannot click "Next" with invalid data

**Test Cases:**
- Enter title < 1 char → shows error
- Enter description < 10 chars → shows error
- Leave location empty → shows error
- Fill all fields correctly → can proceed to next step

#### Step 2: Pricing
- [ ] Monthly rent input (number)
- [ ] Viewing fee input (number)
- [ ] Min rent validation (MWK 5,000)
- [ ] Helpful hint text displays

**Test Cases:**
- Enter rent < 5,000 → shows error
- Enter negative viewing fee → shows error
- Enter valid amounts → can proceed

#### Step 3: Property Details
- [ ] Bedrooms input (0-20)
- [ ] Bathrooms input (0-20)
- [ ] Property type dropdown (5 types)
- [ ] Amenities checkboxes (16 options)
- [ ] Can select multiple amenities

**Test Cases:**
- Enter bedrooms > 20 → shows error
- Select no property type → shows error
- Check/uncheck amenities → state updates

#### Step 4: Images
- [ ] Drag & drop zone displays
- [ ] "Select Images" button works
- [ ] Max 10 images enforced
- [ ] File type validation (JPG, PNG, WEBP only)

**Drag & Drop Test:**
1. Open file explorer
2. Select 2-3 images (JPG or PNG)
3. Drag over drop zone → zone highlights
4. Drop images → previews appear
5. Watch compression status badges
6. Verify "Compressing..." → "Ready" transition

**Click to Select Test:**
1. Click "Select Images" button
2. File dialog opens
3. Select multiple images (hold Cmd/Ctrl)
4. Click Open
5. Images appear in preview grid

**Image Features:**
- [ ] Primary image radio button works
- [ ] First image auto-selected as primary
- [ ] Click radio to change primary
- [ ] "Primary Image" badge shows on selected
- [ ] Hover over image → "Remove" button appears
- [ ] Click Remove → image deleted from grid
- [ ] File size displays on hover (Original → Compressed)
- [ ] Status badges: Compressing, Ready, Error

**Test Cases:**
- Try uploading 11 images → alert shown
- Try uploading .pdf file → error message
- Upload very large image (>5MB) → compresses to ~300KB
- Remove all images → empty state shows

#### Form Submission
- [ ] Cannot submit without images
- [ ] Submit with all valid data → success alert
- [ ] Alert shows summary (title, location, price, image count)

#### Navigation
- [ ] Progress bar updates with each step
- [ ] Step indicator shows current step
- [ ] "Previous" button goes back
- [ ] Form data persists when going back
- [ ] "Submit Listing" button on step 4

---

### Test 5: Property Cards ✅

**Location:** Homepage or Browse page

**Card Components:**
- [ ] Property image displays
- [ ] Image counter (1/5) in corner
- [ ] Price formatted (MWK X,XXX/month)
- [ ] Property title
- [ ] Location with pin icon
- [ ] Quick stats: bedrooms, bathrooms, type
- [ ] "Available" badge (green dot)
- [ ] Heart icon (save button)

**Interactions:**
- [ ] Hover over card → elevates with shadow
- [ ] Click card → navigates to detail page (not yet built)
- [ ] Click heart → animates (toggle saved state)
- [ ] Heart filled when saved, outline when not

---

### Test 6: Responsive Design ✅

**Test Breakpoints:**

#### Mobile (375px)
- [ ] Single column layout
- [ ] Hamburger menu visible
- [ ] Bottom nav shows (when logged in)
- [ ] Cards stack vertically
- [ ] Text readable
- [ ] Buttons easily tappable
- [ ] No horizontal scroll

#### Tablet (768px)
- [ ] 2-3 column grid
- [ ] Navbar shows all links
- [ ] Bottom nav hidden
- [ ] Cards display in rows

#### Desktop (1024px+)
- [ ] 3-4 column grid
- [ ] Full navbar with search
- [ ] Maximum content width (1280px)
- [ ] Proper spacing and padding

---

### Test 7: Animations ✅

**What to Check:**
- [ ] Page transitions smooth (when navigating)
- [ ] Property cards animate on scroll
- [ ] Staggered entrance animation
- [ ] Button hover effects
- [ ] Modal open/close animations
- [ ] Form step transitions
- [ ] Image upload animations
- [ ] Drawer slide animations

**Performance:**
- [ ] Animations run at 60fps (no jank)
- [ ] No lag when scrolling
- [ ] Smooth on slower devices

---

### Test 8: Form Validation ✅

**Required Fields Test:**
1. Go to Add Property page
2. Click "Next" without filling anything
3. Verify errors show for all required fields
4. Fill one field → error disappears
5. Fill all fields → can proceed

**Validation Rules:**
- Title: 1-100 chars
- Description: 10-1500 chars
- Location: required
- Price: 5,000 - 999,999,999 MWK
- Viewing fee: 0 - 999,999 MWK
- Bedrooms: 0-20
- Bathrooms: 0-20
- Property type: required
- Images: at least 1

---

### Test 9: Browser Compatibility ✅

**Test in Multiple Browsers:**

#### Chrome/Edge
- [ ] All features work
- [ ] Animations smooth
- [ ] No console errors

#### Firefox
- [ ] All features work
- [ ] Drag & drop works
- [ ] File compression works

#### Safari (if on Mac)
- [ ] All features work
- [ ] WebP images supported
- [ ] Animations smooth

---

### Test 10: Performance ✅

**Lighthouse Test:**
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Run test on Homepage
4. Check scores:
   - Performance: >80
   - Accessibility: >90
   - Best Practices: >90
   - SEO: >80

**Network Test:**
1. Open DevTools → Network tab
2. Throttle to "Slow 3G"
3. Reload page
4. Check load time (<3s acceptable for slow network)
5. Verify images load progressively

**Image Compression Test:**
1. Upload a large image (e.g., 5MB)
2. Check compressed size in preview (should be ~300KB)
3. Verify quality still good

---

## 🐛 Common Issues & Solutions

### Issue 1: Dev server not starting
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue 2: Images not compressing
**Solution:**
- Check browser console for errors
- Verify `browser-image-compression` installed
- Try uploading smaller image first

### Issue 3: Animations laggy
**Solution:**
- Check browser GPU acceleration enabled
- Close other apps to free up resources
- Test in Incognito mode (disable extensions)

### Issue 4: Form not submitting
**Solution:**
- Check all required fields filled
- Verify at least 1 image uploaded
- Open console to see validation errors

### Issue 5: Mobile menu not opening
**Solution:**
- Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- Check console for JavaScript errors
- Verify window width <768px

---

## ✅ Sign-Off Checklist

Before moving to Day 3, verify:

- [ ] All Day 2 tasks completed (6/6)
- [ ] No linter errors
- [ ] All tests passed
- [ ] Mobile responsive verified
- [ ] Animations smooth
- [ ] Image upload working
- [ ] Form validation working
- [ ] No console errors
- [ ] Code committed to Git
- [ ] Documentation updated

---

## 📸 Screenshots to Capture

**For Documentation:**
1. Homepage (desktop + mobile)
2. Property card close-up
3. Add property form (all 4 steps)
4. Image upload component with previews
5. Mobile navigation drawer
6. Design system showcase

**For Social Media:**
1. Beautiful homepage hero section
2. Property cards grid
3. Image upload with drag & drop
4. Multi-step form progress

---

## 🎯 Success Criteria

✅ All features working as designed  
✅ No critical bugs  
✅ Mobile responsive  
✅ Performance optimized  
✅ Code quality high  
✅ Ready for Day 3  

---

**Testing Complete!** 🎉

If all tests pass, you're ready to move to Day 3: Property Detail Page & Browse/Search functionality.

