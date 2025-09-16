import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EpubReaderEngine } from '@/components/EpubReaderEngine';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DebugEpub = () => {
  const navigate = useNavigate();
  const [epubUrl, setEpubUrl] = useState('/ebooks/01-LES_OMBRES_DU_CATACLYSME_ANT_-_Maxime_LAUGE.epub');
  const [testUrl, setTestUrl] = useState('');
  const [showReader, setShowReader] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setDebugLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const testEpub = () => {
    const urlToTest = testUrl || epubUrl;
    addLog(`Testing EPUB: ${urlToTest}`);
    setEpubUrl(urlToTest);
    setShowReader(true);
  };

  const clearLogs = () => {
    setDebugLogs([]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Debug EPUB Reader</h1>
        </div>

        {!showReader ? (
          <div className="space-y-6">
            {/* Test Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Test EPUB Reader</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    EPUB URL par défaut:
                  </label>
                  <Input 
                    value={epubUrl} 
                    onChange={(e) => setEpubUrl(e.target.value)}
                    placeholder="URL vers fichier EPUB"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ou tester une autre URL:
                  </label>
                  <Input 
                    value={testUrl} 
                    onChange={(e) => setTestUrl(e.target.value)}
                    placeholder="Entrez une URL EPUB"
                  />
                </div>

                <Button onClick={testEpub} className="w-full">
                  Tester le lecteur EPUB
                </Button>
              </CardContent>
            </Card>

            {/* Debug Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  Logs de debug
                  <Button variant="outline" size="sm" onClick={clearLogs}>
                    Effacer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md max-h-64 overflow-y-auto font-mono text-sm">
                  {debugLogs.length === 0 ? (
                    <p className="text-muted-foreground">Aucun log pour le moment...</p>
                  ) : (
                    debugLogs.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Environment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations environnement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>User Agent:</strong>
                    <p className="text-muted-foreground break-all">{navigator.userAgent}</p>
                  </div>
                  <div>
                    <strong>Support React Reader:</strong>
                    <p className="text-muted-foreground">
                      {typeof window !== 'undefined' ? '✅ Disponible' : '❌ Non disponible'}
                    </p>
                  </div>
                  <div>
                    <strong>URL actuelle:</strong>
                    <p className="text-muted-foreground break-all">{window.location.href}</p>
                  </div>
                  <div>
                    <strong>localStorage EPUB:</strong>
                    <p className="text-muted-foreground">
                      {Object.keys(localStorage).filter(key => key.includes('epub')).length} entrées
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => setShowReader(false)}>
              ← Retour aux tests
            </Button>
            
            <div className="h-[80vh] border rounded-lg overflow-hidden">
              <EpubReaderEngine
                epubUrl={epubUrl}
                fontSize={16}
                highContrast={false}
                isPremium={true}
                isAlreadyRead={false}
                hasFinished={false}
                pointsToWin={50}
                onFinishReading={() => addLog('Lecture terminée !')}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};