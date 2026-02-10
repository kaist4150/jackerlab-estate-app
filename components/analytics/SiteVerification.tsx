interface SiteVerificationProps {
  naver?: string;
  google?: string;
}

export default function SiteVerification({ naver, google }: SiteVerificationProps) {
  const naverCode = naver || process.env.NEXT_PUBLIC_NAVER_VERIFICATION;
  const googleCode = google || process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;

  return (
    <>
      {naverCode && (
        <meta name="naver-site-verification" content={naverCode} />
      )}
      {googleCode && (
        <meta name="google-site-verification" content={googleCode} />
      )}
    </>
  );
}
