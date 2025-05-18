'use client';

import React from 'react';
import MigrationPrompt from '../../components/wallet/MigrationPrompt';
import './page.css';

export default function MigrationPage() {
  // Obtener email del usuario actual (en prod se usaría un contexto de autenticación)
  const userEmail = localStorage.getItem('fractea_user_email') || 'demo@fractea.app';
  
  return (
    <div className="migration-page">
      <div className="migration-page-header">
        <div className="back-button" onClick={() => window.history.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Migración a Wallet Auto-Custodiada</h1>
      </div>
      
      <div className="migration-page-content">
        <div className="migration-intro">
          <h2>¿Por qué migrar a una wallet auto-custodiada?</h2>
          <p>
            Las wallets auto-custodiadas te dan control total sobre tus activos digitales.
            A diferencia de las wallets custodiadas como la que usas actualmente,
            donde Fractea gestiona tus claves privadas, una wallet auto-custodiada
            te da posesión directa de tus claves.
          </p>
          
          <div className="migration-comparison">
            <div className="comparison-item">
              <h3>Wallet Custodial (Actual)</h3>
              <ul>
                <li>✓ Fácil de usar</li>
                <li>✓ No requiere conocimientos técnicos</li>
                <li>✓ Recuperación de cuenta sencilla</li>
                <li>✗ Control limitado</li>
                <li>✗ Dependencia de Fractea</li>
              </ul>
            </div>
            
            <div className="comparison-item">
              <h3>Wallet Auto-Custodiada</h3>
              <ul>
                <li>✓ Control total de tus activos</li>
                <li>✓ Mayor privacidad</li>
                <li>✓ Interoperabilidad con todo el ecosistema Web3</li>
                <li>✗ Requiere cuidado con las claves privadas</li>
                <li>✗ Mayor responsabilidad personal</li>
              </ul>
            </div>
          </div>
          
          <p className="migration-note">
            <strong>Nota:</strong> La migración no es obligatoria. Puedes seguir usando tu wallet custodial
            si prefieres la simplicidad. Tu elección dependerá de tus necesidades y experiencia.
          </p>
        </div>
        
        <div className="migration-prompt-container">
          <MigrationPrompt userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
} 