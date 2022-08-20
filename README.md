# 📸 Briefkasten Screenshot API

[![Demo](https://img.shields.io/badge/demo-app-green?style=flat-square)](https://briefkastenhq.com)
[![Demo](https://img.shields.io/badge/demo-instance-green?style=flat-square)](https://screenshot.briefkastenhq.com/api/image?url=https://google.com)

Separate Fastify API with a single route to take screenshots of pages for [Briefkasten](https://briefkastenhq.com) bookmarks.

See also:

- [Briefkasten App Demo](https://briefkastenhq.com)
- [Briefkasten App Repo](https://github.com/ndom91/briefkasten)
- [Briefkasten Extension Repo](https://github.com/ndom91/briefkasten-extension)
- [Briefkasten Scrape Job Repo](https://github.com/ndom91/briefkasten-scrape)

## 🚀 Getting Started

To run this yourself, you'll only need somewhere to host a Next.js application, like Vercel, Netlify, or a server of your own.

1. Clone the repository

```sh
$ git clone ssh://github.com/ndom91/briefkasten-screenshot
$ cd briefkasten-screenshot
```

2. Install dependencies

```sh
$ pnpm install
```

3. Run the dev server

```sh
$ pnpm dev:vercel
```

You should now have an API Route up and running at [`http://localhost:3000/api/image`](http://localhost:3000/api/image). When pushing to production, don't forget to adjust the CORS header, `Access-Control-Allow-Origin`, to allow your main applications origin to make requests.

## 🏗 Contributing

Open to all contributions, please stick to formatting settings in your PR though!

## 📝 License

MIT
