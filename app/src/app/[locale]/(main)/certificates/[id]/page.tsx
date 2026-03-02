import { CertificateClient } from "./certificate-client";

interface CertificatePageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatePage({
  params,
}: CertificatePageProps) {
  const { id } = await params;
  return <CertificateClient mintAddress={id} />;
}
