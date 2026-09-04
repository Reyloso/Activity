import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    backgroundColor: "#FFFFFF",
  },
  border: {
    flex: 1,
    width: "100%",
    borderWidth: 3,
    borderColor: "#2F3C7E",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    color: "#666666",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#2F3C7E",
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginTop: 10,
  },
  activity: {
    fontSize: 16,
    color: "#333333",
    marginTop: 6,
    textAlign: "center",
  },
  date: {
    fontSize: 11,
    color: "#666666",
    marginTop: 20,
  },
});

function CertificateDocument({
  fullName,
  activityTitle,
  date,
}: {
  fullName: string;
  activityTitle: string;
  date: string;
}) {
  return (
    <Document title={`Certificado - ${activityTitle}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <Text style={styles.eyebrow}>Activity - Capacitación interna</Text>
          <Text style={styles.title}>Certificado de aprobación</Text>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.activity}>ha completado la actividad &quot;{activityTitle}&quot;</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateCertificatePdf(params: {
  fullName: string;
  activityTitle: string;
  date: string;
}) {
  return renderToBuffer(<CertificateDocument {...params} />);
}
