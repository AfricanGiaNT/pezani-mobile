import { useState, useEffect } from 'react';
export const useNetworkQuality = () => {
    const [networkQuality, setNetworkQuality] = useState({
        effectiveType: '4g', // Default assumption
        downlink: 10,
        rtt: 50,
        isSlowConnection: false,
        isSaving: false,
    });
    useEffect(() => {
        // Check if Network Information API is available
        const connection = navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
        if (connection) {
            const updateConnectionStatus = () => {
                const effectiveType = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
                const downlink = connection.downlink; // Mbps
                const rtt = connection.rtt; // Round trip time in ms
                const saveData = connection.saveData; // User has data saver on
                // Determine if connection is slow
                const isSlowConnection = effectiveType === '2g' ||
                    effectiveType === 'slow-2g' ||
                    downlink < 1.5 ||
                    rtt > 400;
                setNetworkQuality({
                    effectiveType,
                    downlink,
                    rtt,
                    isSlowConnection,
                    isSaving: saveData,
                });
            };
            updateConnectionStatus();
            // Listen for connection changes
            connection.addEventListener('change', updateConnectionStatus);
            return () => {
                connection.removeEventListener('change', updateConnectionStatus);
            };
        }
        else {
            // Fallback: Measure actual load time to estimate
            const startTime = performance.now();
            // Load a tiny image to test speed
            const testImage = new Image();
            testImage.src =
                'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            testImage.onload = () => {
                const loadTime = performance.now() - startTime;
                const isSlowConnection = loadTime > 200; // If tiny image takes > 200ms
                setNetworkQuality((prev) => ({
                    ...prev,
                    isSlowConnection,
                }));
            };
        }
    }, []);
    return networkQuality;
};
