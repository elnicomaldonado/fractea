import { useState, useEffect } from 'react';
import { 
  getPropertyDetails, 
  getUserBalance, 
  getClaimableRent, 
  connectWallet 
} from '../utils/blockchain';

function PropertyViewer({ propertyId = 1 }) {
  const [property, setProperty] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [claimableRent, setClaimableRent] = useState('0');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Connect wallet
  async function handleConnect() {
    try {
      setError(null);
      setLoading(true);
      const walletInfo = await connectWallet();
      setWallet(walletInfo);
      
      // After connecting, fetch user-specific data
      if (propertyId) {
        const balance = await getUserBalance(walletInfo.address, propertyId);
        setUserBalance(balance);
        
        const claimable = await getClaimableRent(propertyId, walletInfo.address);
        setClaimableRent(claimable);
      }
    } catch (err) {
      setError(err.message);
      console.error("Connection error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Load property data
  useEffect(() => {
    async function loadPropertyData() {
      try {
        setLoading(true);
        setError(null);
        
        const propertyData = await getPropertyDetails(propertyId);
        setProperty(propertyData);
        
        // If wallet is connected, load user-specific data
        if (wallet?.address) {
          const balance = await getUserBalance(wallet.address, propertyId);
          setUserBalance(balance);
          
          const claimable = await getClaimableRent(propertyId, wallet.address);
          setClaimableRent(claimable);
        }
      } catch (err) {
        setError(err.message);
        console.error("Error loading property data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadPropertyData();
  }, [propertyId, wallet]);

  if (loading) {
    return <div>Loading property information...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="property-viewer">
      <h2>Property #{propertyId}</h2>
      
      {!wallet && (
        <button onClick={handleConnect}>
          Connect Wallet
        </button>
      )}
      
      {wallet && (
        <div className="wallet-info">
          <p>Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
        </div>
      )}
      
      {property && (
        <div className="property-details">
          <div className="detail-row">
            <span>Total Supply:</span>
            <span>{property.totalSupply} fractions</span>
          </div>
          <div className="detail-row">
            <span>Total Rent:</span>
            <span>{property.totalRent} ETH</span>
          </div>
          <div className="detail-row">
            <span>Created:</span>
            <span>{property.createdAt.toLocaleDateString()}</span>
          </div>
          
          {wallet && (
            <>
              <div className="detail-row user-details">
                <span>Your Balance:</span>
                <span>{userBalance} fractions</span>
              </div>
              <div className="detail-row user-details">
                <span>Claimable Rent:</span>
                <span>{claimableRent} ETH</span>
              </div>
              <div className="ownership-percentage">
                <span>Ownership:</span>
                <span>{property.totalSupply > 0 
                  ? ((userBalance / property.totalSupply) * 100).toFixed(2) 
                  : 0}%</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default PropertyViewer; 