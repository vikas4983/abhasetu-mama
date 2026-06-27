"use client";
import FeatureTablePage from "../../../../../components/stakeholder/FeatureTablePage";
export default function Page() {
  return (
    <FeatureTablePage
      title="Hpr"
      description="doctor stakeholder — hpr workspace."
      columns={["ID", "Detail", "ABHA"]}
      rows={[
        {
          id: "1",
          col1: "DEMO-1",
          col2: "Sample record",
          col3: "user@sbx",
          status: "Active",
        },
      ]}
    />
  );
}
