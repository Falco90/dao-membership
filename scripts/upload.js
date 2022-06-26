const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

 async function createContract() {
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      const added = await client.add(data);
      console.log(added);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      console.log(url);
      addContract(url);
    } catch (e) {
      console.log("Error uploading file: ", e);
    }
  }