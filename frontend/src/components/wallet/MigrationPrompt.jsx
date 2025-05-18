import React, { useState } from 'react';
import './MigrationPrompt.css';

// Iconos SVG
const UpgradeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L12 22" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 9L12 2L19 9" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ConnectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8V7C18 5.93913 17.5786 4.92172 16.8284 4.17157C16.0783 3.42143 15.0609 3 14 3H7C5.93913 3 4.92172 3.42143 4.17157 4.17157C3.42143 4.92172 3 5.93913 3 7V14C3 15.0609 3.42143 16.0783 4.17157 16.8284C4.92172 17.5786 5.93913 18 7 18H8" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 16L16 19L21 14" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CreateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Componente de opción de migración
const MigrationOption = ({ title, description, icon, action }) => (
  <div className="migration-option" onClick={action}>
    <div className="migration-option-icon">{icon}</div>
    <div className="migration-option-content">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  </div>
);

/**
 * Inicia conexión con wallet externa existente
 * @param {string} userEmail - Email del usuario actual
 */
const initiateWalletConnect = async (userEmail) => {
  console.log(`Iniciando conexión de wallet para ${userEmail}`);
  
  // En una implementación real, aquí activaríamos WalletConnect o similar
  alert('Conectando wallet externa... Esta función se implementará en la siguiente fase.');
  
  // Para demostración, simular éxito
  return {
    success: true,
    externalAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  };
};

/**
 * Inicia creación de nueva wallet externa
 * @param {string} userEmail - Email del usuario actual
 */
const initiateWalletCreation = (userEmail) => {
  console.log(`Iniciando creación de wallet para ${userEmail}`);
  
  // En una implementación real, aquí iniciaríamos un flujo de creación de wallet
  alert('Creando nueva wallet... Esta función se implementará en la siguiente fase.');
  
  // Para demostración, simular éxito
  return {
    success: true,
    seedPhrase: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
  };
};

/**
 * Componente principal para migración a wallet auto-custodiada
 */
function MigrationPrompt({ userEmail = 'usuario@ejemplo.com' }) {
  const [showDetails, setShowDetails] = useState(false);
  const [step, setStep] = useState(1);
  const [migrationData, setMigrationData] = useState(null);
  
  const handleConnectWallet = async () => {
    const result = await initiateWalletConnect(userEmail);
    setMigrationData(result);
    setStep(2);
  };
  
  const handleCreateWallet = async () => {
    const result = initiateWalletCreation(userEmail);
    setMigrationData(result);
    setStep(2);
  };
  
  return (
    <div className="migration-container">
      {step === 1 && (
        <>
          <div className="migration-header">
            <UpgradeIcon />
            <h3>Mejora tu experiencia blockchain</h3>
          </div>
          
          <p className="migration-description">
            Actualmente usas una wallet custodiada por Fractea.
            Considera migrar a tu propia wallet para máximo control.
          </p>
          
          {showDetails ? (
            <div className="migration-options">
              <MigrationOption 
                title="Conectar wallet existente"
                description="Si ya tienes una wallet, conéctala para transferir tus activos"
                icon={<ConnectIcon />}
                action={handleConnectWallet}
              />
              
              <MigrationOption 
                title="Crear nueva wallet"
                description="Crea una nueva wallet y te guiaremos en el proceso"
                icon={<CreateIcon />}
                action={handleCreateWallet}
              />
            </div>
          ) : (
            <button 
              className="migration-expand-button"
              onClick={() => setShowDetails(true)}
            >
              Conocer más opciones
            </button>
          )}
          
          <p className="migration-footnote">
            Las wallets auto-custodiadas te dan control total sobre tus activos digitales y 
            te permiten interactuar con cualquier aplicación web3 compatible.
          </p>
        </>
      )}
      
      {step === 2 && (
        <div className="migration-success">
          <div className="migration-success-icon">✓</div>
          <h3>¡Proceso iniciado!</h3>
          <p>Se ha iniciado el proceso de migración a tu wallet auto-custodiada.</p>
          <p>Sigue las instrucciones en pantalla para completar el proceso.</p>
          <button 
            className="migration-button"
            onClick={() => setStep(1)}
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
}

export default MigrationPrompt; 