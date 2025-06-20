// Plik: src/components/IntroSection.tsx

import React, { useState, useEffect } from 'react';

const IntroSection: React.FC = () => {
    // 1. Zmień stan początkowy na null lub pusty obiekt {}
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/content');
                const data = await response.json();
                setContent(data);
            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return <div>Ładowanie...</div>; // Opcjonalnie, wskaźnik ładowania
    }

    // 2. Zmień sposób dostępu do danych
    const aboutP = content?.AboutP;
    const aboutImg = content?.AboutIMG;

    return (
        <div id="intro" className="basic-1">
            <div className="container">
                <div className="row">
                    <div className="col-lg-5">
                        <div className="text-container">
                            <div className="section-title">O NAS</div>
                            {/* Użyj zmiennych bezpośrednio */}
                            <p>{aboutP || 'Brak treści AboutP'}</p>
                            <p className="testimonial-text">"Każda chwila spędzona podczas uprawiania sportów wodnych z przyjaciółmi to wyjątkowe przeżycie, które dodaje energii i radości."</p>
                        </div>
                    </div>
                    <div className="col-lg-7">
                        <div className="image-container">
                            {/* Użyj zmiennej bezpośrednio */}
                            <img className="img-fluid" src={aboutImg || 'images/intro-office.jpg'} alt="alternative" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntroSection;