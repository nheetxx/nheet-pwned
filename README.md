# nheet-pwned

A small, mobile-friendly password breach checker built with React and Vite. It checks a password against the Have I Been Pwned (HIBP) Pwned Passwords database using a k-anonymity range search.

The password is hashed in your browser. The app sends only the first five characters of that hash to HIBP, then checks the returned hash suffixes locally.

## Features

- Check whether a password appears in the Pwned Passwords database.
- Show how many times a matched password has appeared.
- Keep the raw password in the browser; it is not sent to the API or saved by this app.
- Responsive layout for desktop and mobile screens.
- No account, API key, backend, database, or environment variables required.

## Tech stack

- React
- Vite
- Web Crypto API for SHA-1 hashing in the browser
- Have I Been Pwned Pwned Passwords API

## Run locally

### Requirements

- Node.js 20.19+ or 22.12+
- npm (included with Node.js)

### Install and start the development server

```sh
git clone https://github.com/nheetxx/nheet-pwned.git
cd nheet-pwned
npm install
npm run dev
```

Open the local URL printed by Vite in your terminal. The development server supports hot reload while you edit the source.

### Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local Vite development server |
| `npm run lint` | Run Oxlint |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

To verify a production build locally:

```sh
npm run lint
npm run build
npm run preview
```

## Deploy to Vercel

This is a static Vite app and can be deployed directly to Vercel. No serverless functions, secrets, or environment variables are needed.

### Deploy from the Vercel dashboard

1. Push this project to `https://github.com/nheetxx/nheet-pwned`.
2. Sign in to [Vercel](https://vercel.com/) and choose **Add New... → Project**.
3. Import the `nheetxx/nheet-pwned` GitHub repository. Authorize Vercel to access it if prompted.
4. Confirm the project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (Vercel may choose this automatically)
5. Leave environment variables empty and select **Deploy**.

Vercel builds the app and provides a deployment URL. After the initial import, pushes to the connected GitHub repository trigger new deployments automatically; production deployments follow the repository's configured production branch, typically `main`.

### Deploy with the Vercel CLI

Install the CLI or use it with `npx`, then run these commands from the project directory:

```sh
npx vercel
npx vercel --prod
```

The first command links the local project and creates a preview deployment. The second creates a production deployment. Follow the CLI prompts to sign in and select or create a Vercel project.

## How the password check works

1. The browser encodes the entered password and calculates its SHA-1 hash with the Web Crypto API.
2. The app splits the hexadecimal hash into a five-character prefix and a suffix.
3. It requests the HIBP range endpoint at `https://api.pwnedpasswords.com/range/{prefix}`. The raw password and full hash are not included in the request.
4. The browser compares the local suffix with the hashes returned for that prefix.
5. If the suffix is present, the app displays the occurrence count. Otherwise, it reports that no match was found in the response.

The request uses HIBP's `Add-Padding` header to request a padded response. The app needs an internet connection to contact HIBP. The service, browser, device, extensions, and network are outside this app's control.

## Privacy and security notes

- The raw password is processed in the browser and is not sent to HIBP.
- Only the first five characters of its SHA-1 hash are sent to the HIBP range API. This is the k-anonymity approach documented by HIBP; it reduces what the API learns, but does not make the request anonymous.
- The app does not store passwords in a database, local storage, or cookies, and does not log them.
- SHA-1 is used only because it is the hash format required by the Pwned Passwords lookup. It is not appropriate for storing or protecting passwords.
- Use a device and browser you trust. A compromised device, malicious browser extension, or monitoring software could still access what you type.
- A “No match found” result does not prove that a password is safe. The database may not contain every password or breach. Do not reuse passwords, and use a password manager and unique passwords for your accounts.

## Troubleshooting

### Secure hashing is not supported

The browser's Web Crypto API requires a secure context. Use `localhost` for local development, or deploy the site over HTTPS.

### The check fails or takes too long

The checker needs to reach the HIBP Pwned Passwords API. Check your connection, try again later, and ensure a browser extension or network policy is not blocking the request. The API may also limit requests temporarily.

### The production build fails

Confirm that a supported Node.js version is installed, then install dependencies and run the build again:

```sh
npm install
npm run build
```

## Project structure

```text
src/
  App.jsx       Checker interface and lookup flow
  App.css       Checker and responsive styles
  index.css     Global styles and theme
  main.jsx      React entry point
index.html      HTML document and page metadata
vite.config.js  Vite configuration
```

## Data source

Password range data is provided by [Have I Been Pwned](https://haveibeenpwned.com/Passwords). Read the [HIBP API documentation](https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange) for details about Pwned Passwords and k-anonymity.
