import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sport.tecnosocialismo.com"),
  title: "Sport — Impara, insegna, competi",
  description: "La rete sportiva peer-to-peer: lezioni gratuite, livelli, tornei e campionati per ogni sport.",
  alternates:{canonical:"/"},
  openGraph:{title:"Sport — Impara, insegna, competi",description:"Ogni livello nasce da una relazione.",url:"/",siteName:"Tecnosocialismo Sport",locale:"it_IT",type:"website",images:[{url:"/og-sport.png",width:1792,height:933,alt:"Sport — Il prossimo livello non si raggiunge da soli."}]},
  twitter:{card:"summary_large_image",title:"Sport — Impara, insegna, competi",description:"Ogni livello nasce da una relazione.",images:["/og-sport.png"]},
};
export const viewport:Viewport={colorScheme:"dark",themeColor:"#090b0b"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="it"><body>{children}</body></html>;}
