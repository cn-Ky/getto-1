import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NOT: `cacheComponents` ve `partialPrefetching` kapatildi.
  // Bu uygulama tamamen oturum (auth/cookies) ve veritabani (Prisma) verisine
  // bagli, yani dinamik. cacheComponents aciksken her dinamik erisim <Suspense>
  // veya "use cache" icinde olmak zorunda; aksi halde prerender hatasi verir.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;