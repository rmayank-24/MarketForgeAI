// FILE: src/pages/HistoryDetailPage.tsx
// PURPOSE: Fetches and displays the full details of a single, past launch kit.

import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppStore } from '../state/store';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultsDisplay from '../components/ResultsDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const HistoryDetailPage: React.FC = () => {
    const { kitId } = useParams<{ kitId: string }>();
    const { isLoading, error, fetchKitDetails, launchKit } = useAppStore();

    useEffect(() => {
        if (kitId) {
            fetchKitDetails(kitId);
        }
    }, [kitId, fetchKitDetails]);

    if (isLoading) {
        return <LoadingSpinner />;
    }
    
    if (error) {
        return <div className="text-center text-red-500 py-12">{error}</div>
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <Link to="/history" className="mb-6 inline-block">
                <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to History
                </Button>
            </Link>
            
            {launchKit ? <ResultsDisplay /> : <p>Launch kit not found.</p>}
        </div>
    );
};

export default HistoryDetailPage;
