import React,{useState} from 'react'
import { Form, Button, Col } from 'react-bootstrap';
import axios from "axios"
import {ethers} from "ethers"


const CreateToken = ({state,account}) => {
    const {contract} = state
    const [name,setName] = useState('')
    const [price,setPrice] = useState('')
    const [royalty,setRoyalty]=useState('')
    const [music,setMusic] = useState('')

    const handleSubmit=async(e)=>{
        e.preventDefault()
        try {
            const data = JSON.stringify({music,name})
            const res = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: data,
                headers: {
                  pinata_api_key: `35cb1bf7be19d2a8fa0d`,
                  pinata_secret_api_key: `2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50`,
                  "Content-Type": "application/json",
                },
              });
              const resData = await res.data;
              console.log(resData)
              
              const tx=  await contract.mintToken(`https://ipfs.io/ipfs/${resData.IpfsHash}`,ethers.parseEther(price),ethers.parseEther(royalty))
              await tx.wait()
              console.log(tx)
                         
        } catch (error) {
            console.error(error)
            
        }

    }
    const uploadOnIpfs = async(e)=>{
        e.preventDefault()
        const file = e.target.files[0];
        if (typeof file !== "undefined") {
            try {
              const formData = new FormData();
              formData.append("file", file);
              // console.log(formData)
              const res = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                  pinata_api_key: `35cb1bf7be19d2a8fa0d`,
                  pinata_secret_api_key: `2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50`,
                  "Content-Type": "multipart/form-data",
                },
              });
              console.log(res);
              const resData = await res.data;
              setMusic(`https://ipfs.io/ipfs/${resData.IpfsHash}`);
            } catch (error) {
              window.alert("ipfs image upload error : ", error);
            }
          }
    }
  return (
    <div>
        <Form onSubmit={handleSubmit}>
      <Form.Group as={Col} controlId="formName">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          name="name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Enter name"
          required
        />
      </Form.Group>

      <Form.Group as={Col} controlId="formPrice">
        <Form.Label>Price</Form.Label>
        <Form.Control
          type="number"
         value={price}
          onChange={(e)=>setPrice(e.target.value)}
          placeholder="Enter price"
          required
        />
      </Form.Group>

      <Form.Group as={Col} controlId="formRoyalty">
        <Form.Label>Royalty Amount</Form.Label>
        <Form.Control
          type="number"
          name="royalty"
          value={royalty}
          onChange={(e)=>setRoyalty(e.target.value)}
          placeholder="Enter royalty amount"
          required
        />
      </Form.Group>

      <Form.Group as={Col} controlId="formFile">
        <Form.Label>Choose Audio File</Form.Label>
        <Form.Control
          type="file"
          name="file"
          accept="audio/*"
          onChange={uploadOnIpfs}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-3" onClick={handleSubmit}>
        Submit
      </Button>
    </Form>

      
    </div>
  )
}

export default CreateToken
