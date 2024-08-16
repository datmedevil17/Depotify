import React, { useState, useEffect } from 'react';
import { Card, Button, ButtonGroup } from 'react-bootstrap';
import Jdenticon from "react-jdenticon";
import { ethers } from "ethers";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const Home = ({ state, account }) => {
  const { contract } = state;
  const [marketItems, setMarketItems] = useState([]);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);

  const loadAllItems = async () => {
    try {
      const items = await contract.getAllUnsoldTokens();
      console.log(items)
      const marketItems = await Promise.all(items.map(async (i) => {
        const uri = await contract.tokenURI(i.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();

        const identiconValue = `${metadata.name}-${metadata.audio}`;
        console.log(metadata.music)

        return {
          tokenId: i.tokenId,
          name: metadata.name,
          price: i.price,
          royalty: i.royalty,
          music: metadata.music,
          identiconValue,
        };
      }));
      setMarketItems(marketItems);
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const buyMarketItem=async(item)=>{
    await (await contract.buyToken(item.tokenId, { value: item.price })).wait()
    loadMarketplaceItems()


    
  }

  useEffect(() => {
    loadAllItems();
  }); // Added dependency array to prevent infinite re-renders

  const handlePrevious = () => {
    setCurrentAudioIndex((prevIndex) => (prevIndex === 0 ? marketItems.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentAudioIndex((prevIndex) => (prevIndex === marketItems.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div className="d-flex flex-wrap justify-content-center">
    
      {marketItems.length > 0 ? (
        <Card style={{ width: '18rem', margin: '1rem' }} key={marketItems[currentAudioIndex].tokenId}>
          <Card.Body>
            <Card.Title>{marketItems[currentAudioIndex].name}</Card.Title>
            <Jdenticon value={marketItems[currentAudioIndex].identiconValue} size="100" />
            <Card.Text>
              <strong>Price:</strong> {ethers.formatEther(marketItems[currentAudioIndex].price)} ETH<br />
              <strong>Royalty:</strong> {ethers.formatEther(marketItems[currentAudioIndex].royalty)}
            </Card.Text>
            <AudioPlayer
              autoPlay
              src={marketItems[currentAudioIndex].music}
              onPlay={e => console.log("Playing")}
              customAdditionalControls={[]}
              customVolumeControls={[]}
              showJumpControls={false}
              layout="horizontal-reverse"
            />
            <ButtonGroup className="mt-3">
              <Button variant="secondary" onClick={handlePrevious}>Previous</Button>
              <Button variant="secondary" onClick={handleNext}>Next</Button>
            </ButtonGroup>
            <Button onClick={() => buyMarketItem(marketItems[currentItemIndex])} variant="primary" size="lg">
                      {`Buy for ${ethers.formatEther(marketItems[currentItemIndex].price)} ETH`}
                    </Button>
          </Card.Body>
        </Card>
      ) : (
        <p>Loading items...</p>
      )}
    </div>
  );
};

export default Home;
