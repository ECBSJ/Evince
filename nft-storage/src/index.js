import { NFTStorage } from "nft.storage"

async function getExampleImage() {
  const imageOriginUrl = "https://c-fa.cdn.smule.com/smule-gg-uw1-s-8/arr/b0/08/6a0e9bb0-16e1-43bf-8562-21b17de3d70a.jpg"
  const r = await fetch(imageOriginUrl)
  if (!r.ok) {
    throw new Error(`error fetching image: [${r.statusCode}]: ${r.status}`)
  }

  let blobber = await r.blob()
  console.log(blobber)

  return blobber
}

async function storeExampleNFT() {
  const image = await getExampleImage()
  const nft = {
    image, // use image Blob as `image` field
    name: "Storing the World's Most Valuable Virtual Assets with NFT.Storage",
    description: "The metaverse is here. Where is it all being stored?",
    properties: {
      type: "blog-post",
      origins: {
        http: "https://blog.nft.storage/posts/2021-11-30-hello-world-nft-storage/",
        ipfs: "ipfs://bafybeieh4gpvatp32iqaacs6xqxqitla4drrkyyzq6dshqqsilkk3fqmti/blog/post/2021-11-30-hello-world-nft-storage/"
      },
      authors: [{ name: "David Choi" }],
      content: {
        "text/markdown": "The last year has witnessed the explosion of NFTs onto the world’s mainstage. From fine art to collectibles to music and media, NFTs are quickly demonstrating just how quickly grassroots Web3 communities can grow, and perhaps how much closer we are to mass adoption than we may have previously thought. <... remaining content omitted ...>"
      }
    }
  }

  const client = new NFTStorage({ token: API_KEY })
  const metadata = await client.store(nft)

  console.log("NFT data stored!")
  console.log("Metadata URI: ", metadata.url)
  console.log(metadata)
}

storeExampleNFT()

// https url for IPFS metadata: https://bafyreidzphn3ukgscrdhmu4adyx26chotk7nblfeoj47u4b2n3sdirhpea.ipfs.dweb.link/
// https url for raw json metadata: https://bafyreidzphn3ukgscrdhmu4adyx26chotk7nblfeoj47u4b2n3sdirhpea.ipfs.nftstorage.link/metadata.json
// https url for image: https://bafybeig53k5ch37y2wl624m53jchevkpbchlgnqjge34thcagcvp5y4xhu.ipfs.dweb.link/blob
