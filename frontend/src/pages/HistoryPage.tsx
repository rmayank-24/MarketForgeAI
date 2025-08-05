// FILE: src/pages/HistoryPage.tsx
// PURPOSE: Displays a list of the user's previously generated launch kits.

import React, { useEffect } from 'react';
import { useAppStore } from '../state/store';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from "@/components/ui/button"; // <-- FIX: Added the missing import
import LoadingSpinner from '../components/LoadingSpinner';
import { History } from 'lucide-react';

const HistoryPage: React.FC = () => {
    const { historyList, isLoading, fetchHistory } = useAppStore();

    useEffect(() => {
        // This effect runs once when the component mounts to fetch the history
        fetchHistory();
    }, [fetchHistory]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <History className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Generation History</h1>
            </div>
            
            {historyList && historyList.length > 0 ? (
                <div className="space-y-4">
                    {historyList.map((item) => (
                        <Link to={`/history/${item.id}`} key={item.id} className="block no-underline">
                            <Card className="hover:border-primary transition-colors bg-card/50">
                                <CardContent className="p-4 flex justify-between items-center">
                                    <p className="font-semibold truncate pr-4">{item.product_idea}</p>
                                    <span className="text-sm text-muted-foreground flex-shrink-0">
                                        {new Date(item.created_at).toLocaleDateString()}
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <p>You haven't generated any launch kits yet.</p>
                        <Link to="/">
                            <Button variant="link" className="mt-2">
                                Generate your first one!
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default HistoryPage;
