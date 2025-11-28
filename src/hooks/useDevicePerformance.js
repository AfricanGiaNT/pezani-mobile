import { useState, useEffect } from 'react';
export const useDevicePerformance = () => {
    const [performance, setPerformance] = useState({
        isLowEnd: false,
        deviceMemory: null,
        hardwareConcurrency: navigator.hardwareConcurrency || 4,
    });
    useEffect(() => {
        // Check device memory (if available)
        const deviceMemory = navigator.deviceMemory;
        const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        let isLowEnd = false;
        if (deviceMemory !== undefined) {
            // Less than 4GB RAM = low-end device
            isLowEnd = deviceMemory < 4;
        }
        else {
            // Fallback: check hardware concurrency (CPU cores)
            isLowEnd = hardwareConcurrency < 4;
        }
        setPerformance({
            isLowEnd,
            deviceMemory,
            hardwareConcurrency,
        });
    }, []);
    return performance;
};
