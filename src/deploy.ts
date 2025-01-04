import { $ } from 'bun'

const args: Record<string, string> = {}

for (const arg of process.argv.slice(2)) {
    const idx = arg.indexOf('=')
    if (idx === -1) {
        console.error(`Invalid argument: ${arg}`)
        process.exit(1)
    }
    const key = arg.slice(0, idx)
    const value = arg.slice(idx + 1)

    args[key] = Buffer.from(value, 'base64').toString()
}

if (!args.container) {
    console.error('No container specified')
    process.exit(1)
}

const { container, auth } = args

if (!container) {
    console.error('No container specified')
    process.exit(1)
}

const [containerInfo] = await $`docker inspect ${container}`.json()
console.log(`Image digest is ${containerInfo.Image}`)

const [imageInfo] = await $`docker inspect ${containerInfo.Image}`.json()
if (!imageInfo.RepoTags.length) {
    console.log('RepoTags is empty, is the image pinned?')
    process.exit(1)
}

if (auth) {
    const [host, user, pass] = auth.split(':')
    console.log(`Logging in to ${host} as ${user}`)
    await $`docker login ${host} --username ${user} --password ${pass}`
}

console.log(`Image RepoTags is ${imageInfo.RepoTags[0]}, pulling...`)
await $`docker pull ${imageInfo.RepoTags[0]}`

console.log('Restarting service')

await $`systemctl restart ${`docker-${container}`}`
