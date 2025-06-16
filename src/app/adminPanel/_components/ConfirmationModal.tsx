// app/cms/_components/ConfirmationModal.tsx (Przykład)
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    // Uczyń onCancel i onClose opcjonalnymi, ale jeśli są przekazane, używaj ich bezpiecznie
    onCancel?: () => void;
    onClose?: () => void; // Często używane dla zamykania np. kliknięciem tła/ESC/przyciskiem 'X'
    isConfirming?: boolean; // Opcjonalne
    // Inne propsy stylizujące itp.
}

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel, // Prop onCancel
    onClose,  // Prop onClose
    isConfirming = false,
    // ...inne propsy
}: ConfirmationModalProps) {

    if (!isOpen) return null; // Nie renderuj, gdy nie jest otwarty

    // Funkcja zamykająca modal
    // W idealnym przypadku logika przycisku 'X' i kliknięcia tła
    // powinna wywołać tę funkcję. Ona może następnie wywołać onCancel lub onClose.
    const handleClose = () => {
        // Wywołaj prop onClose, jeśli istnieje.
        // Często onClose jest używane jako główny handler zamykania.
        // Możesz też wywołać onCancel tutaj, jeśli taka jest konwencja.
        if (onClose) {
            onClose();
        } else if (onCancel) {
            // Fallback, jeśli przekazano tylko onCancel
            onCancel();
        }
        // Jeśli żaden prop zamykający nie jest przekazany, modal nie będzie zamykalny przez te metody
    };

    // Przykładowy przycisk "X" w nagłówku modala
    // Ten przycisk powinien wywoływać handleClose lub bezpośrednio onCancel/onClose
    // Upewnij się, że logika ZAWSZE sprawdza, czy prop istnieje przed wywołaniem
    // np. onClick={onCancel ? onCancel : undefined} LUB onClick={handleClose}
    const handleCancelClick = () => {
        // Sprawdź, czy onCancel istnieje przed wywołaniem
        if (onCancel) {
            onCancel();
        }
        // Alternatywnie: handleClose();
    };

    return (
        <div className="modal-overlay"> {/* Warstwa przyciemniająca tło */}
            <div className="modal-content"> {/* Kontener modala */}
                <div className="modal-header">
                    <h2>{title}</h2>
                    {/* Przycisk X - upewnij się, że poprawnie wywołuje handler zamykania */}
                    {/* Sprawdzenie `onClose` lub `onCancel` przed przypisaniem handlera do onClick */}
                    {(onClose || onCancel) && (
                         <button onClick={handleClose} className="close-button">×</button> // Przycisk X wywołuje handleClose
                    )}
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={onConfirm} disabled={isConfirming}>Potwierdź</button>
                    {/* Przycisk Anuluj - upewnij się, że poprawnie wywołuje handler zamykania */}
                     {/* Sprawdzenie `onCancel` lub `onClose` przed przypisaniem handlera do onClick */}
                     {(onCancel || onClose) && (
                         <button onClick={handleCancelClick} disabled={isConfirming}>Anuluj</button> // Przycisk Anuluj wywołuje handleCancelClick
                         // Alternatywnie: <button onClick={handleClose} disabled={isConfirming}>Anuluj</button>
                     )}

                </div>
            </div>
        </div>
    );
}