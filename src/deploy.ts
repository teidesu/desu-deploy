import { $ } from 'bun'

const container = process.argv[2]

const [containerInfo] = await $`docker inspect ${container}`.json()
console.log(`Image digest is ${containerInfo.Image}`)

const [imageInfo] = await $`docker inspect ${containerInfo.Image}`.json()
if (!imageInfo.RepoTags.length) {
    console.log('RepoTags is empty, is the image pinned?')
    process.exit(1)
}

console.log(`Image RepoTags is ${imageInfo.RepoTags[0]}, pulling...`)
await $`docker pull ${imageInfo.RepoTags[0]}`

console.log('Restarting service')

await $`systemctl restart ${`docker-${container}`}`
