import { PackingDemo } from "@/components/packing-demo";
import { getItemArt } from "@/lib/packing/art";

export default async function Home() {
  return <PackingDemo art={await getItemArt()} />;
}
