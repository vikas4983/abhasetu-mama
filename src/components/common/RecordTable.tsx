import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { records } from '@/constants/data';

export function RecordTable() {
  return (
    <section className="record-table" aria-label="Health records">
      <div className="table-row table-head">
        <span>Document</span>
        <span>Type</span>
        <span>Date</span>
        <span>Source</span>
        <span>Action</span>
      </div>
      {records.map((record) => (
        <div className="table-row" key={record.id}>
          <span>{record.name}</span>
          <span>{record.type}</span>
          <span>{record.date}</span>
          <span>{record.source}</span>
          <Link className="table-action" to="/digital-locker">
            <Eye className="small-icon" aria-hidden="true" />
            View
          </Link>
        </div>
      ))}
    </section>
  );
}
