import {
  Circle,
  Document,
  Defs,
  LinearGradient,
  Page,
  Path,
  Polygon,
  Rect,
  Stop,
  Svg,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const NAVY = "#14214f";
const BRAND_LIGHT_1 = "#e1e8ff";
const BRAND_LIGHT_2 = "#f6f9ff";
const BRAND_LIGHT_3 = "#f9fafb";

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const SIDEBAR_WIDTH = PAGE_WIDTH * 0.26;
const MAIN_WIDTH = PAGE_WIDTH - SIDEBAR_WIDTH;
const MAIN_HEIGHT = PAGE_HEIGHT;

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  sidebar: {
    width: "26%",
    paddingVertical: 40,
    paddingHorizontal: 24,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  spacer: {
    flexGrow: 1,
  },
  logoBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C7CBE0",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 24,
  },
  logoBoxText: {
    fontSize: 10,
    fontWeight: 700,
    color: NAVY,
    textAlign: "center",
    letterSpacing: 1,
  },
  orgName: {
    fontSize: 11,
    fontWeight: 700,
    color: NAVY,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  orgSub: {
    fontSize: 8,
    color: "#8A8FA3",
    textAlign: "center",
    marginTop: 4,
  },
  signatureWrap: {
    alignItems: "center",
    width: "100%",
  },
  signatureName: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    color: NAVY,
    marginBottom: 4,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#C7CBE0",
    width: "70%",
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 8,
    color: "#8A8FA3",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  main: {
    flex: 1,
    position: "relative",
    paddingVertical: 56,
    paddingHorizontal: 56,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 12,
    color: BRAND_LIGHT_1,
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    color: "#FFFFFF",
    marginTop: 6,
  },
  name: {
    fontSize: 26,
    fontFamily: "Times-Roman",
    color: "#FFFFFF",
    marginTop: 30,
  },
  dateLine: {
    fontSize: 10,
    color: BRAND_LIGHT_1,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 8,
  },
  footerText: {
    fontSize: 9,
    color: NAVY,
    lineHeight: 1.5,
  },
});

function MedalIcon() {
  return (
    <Svg width={56} height={72} viewBox="0 0 56 72">
      <Polygon points="16,26 22,58 28,44 34,58 40,26" fill={NAVY} />
      <Circle cx={28} cy={22} r={20} fill={NAVY} />
      <Circle cx={28} cy={22} r={14} fill="#FFFFFF" />
      <Path
        d="M28 12 L31 19 L38 19 L32.5 23.5 L34.5 31 L28 26.5 L21.5 31 L23.5 23.5 L18 19 L25 19 Z"
        fill={NAVY}
      />
    </Svg>
  );
}

function GradientBackground() {
  const w = MAIN_WIDTH;
  const h = MAIN_HEIGHT;
  return (
    <Svg
      style={{ position: "absolute", top: 0, left: 0 }}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
    >
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={NAVY} />
          <Stop offset="0.72" stopColor={NAVY} />
          <Stop offset="0.85" stopColor={BRAND_LIGHT_1} />
          <Stop offset="0.93" stopColor={BRAND_LIGHT_2} />
          <Stop offset="1" stopColor={BRAND_LIGHT_3} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={w} height={h} fill="url(#bg)" />
      <Polygon points={`0,0 ${w * 0.3},0 ${w * 0.1},${h * 0.33}`} fill="#FFFFFF" fillOpacity={0.04} />
      <Polygon points={`${w},0 ${w},${h * 0.43} ${w * 0.67},${h * 0.14}`} fill="#FFFFFF" fillOpacity={0.05} />
      <Polygon
        points={`${w * 0.39},0 ${w * 0.55},${h * 0.21} ${w * 0.32},${h * 0.29}`}
        fill="#FFFFFF"
        fillOpacity={0.03}
      />
    </Svg>
  );
}

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
        <View style={styles.sidebar}>
          <MedalIcon />
          <View style={styles.logoBox}>
            <Text style={styles.logoBoxText}>ACTIVITY</Text>
            <Text style={styles.logoBoxText}>MILIO</Text>
          </View>
          <View style={styles.spacer} />
          <View>
            <Text style={styles.orgName}>MILIO PAY</Text>
            <Text style={styles.orgSub}>Equipo de alto rendimiento</Text>
          </View>
          <View style={styles.spacer} />
          <View style={styles.signatureWrap}>
            <Text style={styles.signatureName}>Reinaldo López S.</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Tech Lead Milio</Text>
          </View>
        </View>

        <View style={styles.main}>
          <GradientBackground />
          <View>
            <Text style={styles.eyebrow}>Activity Milio · Capacitación interna</Text>
            <Text style={styles.title}>CERTIFICADO</Text>
          </View>
          <View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.dateLine}>Otorgado el {date}</Text>
          </View>
          <Text style={styles.footerText}>
            Habiendo completado la actividad &quot;{activityTitle}&quot;, se otorga el presente
            certificado de aprobación dentro del programa de capacitación interna de Milio Pay.
          </Text>
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
