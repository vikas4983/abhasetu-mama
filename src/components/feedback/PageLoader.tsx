import { CircularProgress } from '@mui/material';

export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <CircularProgress />
    </div>
  );
}
