This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Accès et rôles

Les rôles de démonstration et les comptes en mémoire sont des données de démonstration. Le mot de passe de démonstration est `etam2025`; les raccourcis de connexion par rôle sont désactivés en production.

L’application ne dispose pas encore d’authentification serveur, de stockage de mots de passe ni de sessions signées. Les rôles de l’interface ne protègent donc pas les API, qui restent accessibles aux clients HTTP. N’expose pas de données réelles avant d’avoir ajouté une authentification serveur et des contrôles de rôle sur chaque route.

## Déploiement sur Vercel

1. Crée un cluster MongoDB Atlas et un utilisateur de base de données avec les droits nécessaires. Prisma avec MongoDB a besoin d’un replica set ; Atlas en fournit un.
2. Dans Vercel, importe le dépôt et choisis `apps` comme **Root Directory**. Le framework Next.js et les commandes d’installation/build sont définis dans `vercel.json`.
3. Dans **Settings → Environment Variables**, configure `DATABASE_URL` avec l’URI Atlas, y compris le nom de base, par exemple `mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority`. Encode les caractères spéciaux du mot de passe et garde cette valeur privée.
4. Pour créer les collections et charger les exemples, lie la CLI au projet puis récupère sa variable locale : `pnpm dlx vercel link`, `pnpm dlx vercel env pull .env.local`, `pnpm run db:push`, puis `pnpm run db:seed`.
5. Déploie. Le build génère le client Prisma puis compile l’application.

Pour déployer avec la CLI : depuis `apps`, configure `DATABASE_URL` dans les environnements Preview et Production du projet Vercel, puis exécute `pnpm dlx vercel --prod`.

MongoDB Atlas peut filtrer les connexions par IP. Les adresses sortantes Vercel sont dynamiques par défaut ; les IP statiques Vercel sont une option pour les offres Pro et Enterprise. Configure l’accès réseau Atlas en fonction de l’offre et du niveau de restriction souhaités.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
