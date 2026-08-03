import { Button, Spinner } from 'react-bootstrap';
import { useGetMediaSignedUrlMutation } from '@/features/campaigns/campaignsApi';
import { useGetProofSignedUrlQuery } from '@/features/submissions/submissionsApi';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface SignedCampaignMediaProps {
  objectKeyOrUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  showDownload?: boolean;
  downloadFileName?: string;
}

export function SignedCampaignMedia({ objectKeyOrUrl, mediaType, alt = 'Media', className, style, showDownload, downloadFileName }: SignedCampaignMediaProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [getMediaSignedUrl] = useGetMediaSignedUrlMutation();

  useEffect(() => {
    let cancelled = false;
    getMediaSignedUrl(objectKeyOrUrl)
      .unwrap()
      .then((res) => { if (!cancelled) setSignedUrl(res.signedUrl); })
      .catch(() => { if (!cancelled) setSignedUrl(null); });
    return () => { cancelled = true; };
  }, [objectKeyOrUrl, getMediaSignedUrl]);

  function handleDownload() {
    if (!objectKeyOrUrl) return;
    const apiBase = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:3000';
    const gcsPrefix = 'https://storage.googleapis.com/';
    let objectKey = objectKeyOrUrl;
    if (objectKeyOrUrl.startsWith(gcsPrefix)) {
      const withoutOrigin = objectKeyOrUrl.slice(gcsPrefix.length);
      const slashIdx = withoutOrigin.indexOf('/');
      if (slashIdx !== -1) objectKey = decodeURIComponent(withoutOrigin.slice(slashIdx + 1));
    }
    const downloadUrl = `${apiBase}/campaigns/media-download?objectKey=${encodeURIComponent(objectKey)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadFileName ?? (mediaType === 'VIDEO' ? 'campaign-media.mp4' : 'campaign-media.jpg');
    a.click();
  }

  if (!signedUrl) {
    return <div className="d-flex align-items-center justify-content-center bg-light rounded-2" style={{ minHeight: 80, ...style }}><Spinner animation="border" size="sm" /></div>;
  }

  return (
    <div className="position-relative">
      {mediaType === 'VIDEO' ? (
        <video src={signedUrl} controls className={className} style={style} />
      ) : (
        <img src={signedUrl} alt={alt} className={className} style={style} />
      )}
      {showDownload && (
        <Button
          size="sm"
          variant="dark"
          className="position-absolute top-0 end-0 m-1 d-flex align-items-center gap-1"
          style={{ opacity: 0.85 }}
          onClick={handleDownload}
          title="Download media"
        >
          <Download size={13} /> Save
        </Button>
      )}
    </div>
  );
}

interface SignedProofImageProps {
  submissionId: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function SignedProofImage({ submissionId, className, style }: SignedProofImageProps) {
  const { data, isLoading } = useGetProofSignedUrlQuery(String(submissionId));

  if (isLoading) {
    return <div className="d-flex align-items-center justify-content-center bg-light rounded-2" style={{ minHeight: 60, ...style }}><Spinner animation="border" size="sm" /></div>;
  }
  if (!data?.signedUrl) {
    return <span className="text-secondary small">Proof unavailable</span>;
  }
  return <img src={data.signedUrl} alt="Submission proof" className={className} style={style} />;
}
