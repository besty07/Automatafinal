import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export interface AgreementData {
  // ── Deal identifiers ──────────────────────────────────────────────────────
  dealId:              string;
  // ── Farmer (Seller) ───────────────────────────────────────────────────────
  farmerName:          string;
  farmerId?:           string;
  farmerPhone?:        string;
  farmerAadhar?:       string;
  farmerAddress:       string;   // location from deal
  // ── Dealer (Buyer) ────────────────────────────────────────────────────────
  dealerName:          string;
  dealerUid?:          string;
  dealerContact?:      string;   // contactName
  dealerPhone?:        string;
  dealerEmail?:        string;
  dealerBusinessType?: string;
  dealerState?:        string;
  // ── Deal terms ────────────────────────────────────────────────────────────
  crop:                string;
  quantity:            string;
  askPrice:            string;
  harvestDate?:        string;
  transportDate?:      string;
  deliveryLocation?:   string;
  // ── Dates ─────────────────────────────────────────────────────────────────
  acceptedAt?:         string;
  createdAt?:          string;
}

export async function downloadAgreementPdf(data: AgreementData) {
  const html = buildHTML(data);
  try {
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save / Share Agreement',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Saved', `Agreement PDF saved at:\n${uri}`);
    }
  } catch {
    Alert.alert('Error', 'Could not generate the PDF. Please try again.');
  }
}

// ─── HTML template ────────────────────────────────────────────────────────────
function buildHTML(d: AgreementData): string {
  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  const agreementId = d.dealId.slice(0, 14).toUpperCase();
  const maskedAadhar = d.farmerAadhar
    ? `XXXX XXXX ${d.farmerAadhar.slice(-4)}`
    : 'As registered with Krishi-Mitra';
  const jurisdiction = d.farmerAddress
    ? d.farmerAddress.split(',').slice(-1)[0]?.trim() || 'the place of delivery'
    : 'the place of delivery';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; color:#111; background:#fff; padding:36px 44px; font-size:13px; line-height:1.6; }
    .top-header { display:flex; align-items:flex-start; justify-content:space-between; border-bottom:3px solid #2D7A3A; padding-bottom:14px; margin-bottom:20px; }
    .logo-block .logo { font-size:24px; font-weight:800; color:#2D7A3A; letter-spacing:0.4px; }
    .logo-block .logo span { color:#1B2B1C; }
    .logo-block .tagline { font-size:10px; color:#777; margin-top:2px; }
    .meta-block { text-align:right; font-size:11px; color:#555; line-height:1.8; }
    .meta-block strong { color:#1B2B1C; }
    .doc-title { text-align:center; margin:16px 0 20px; }
    .doc-title h1 { font-size:16px; font-weight:800; color:#1B2B1C; text-transform:uppercase; letter-spacing:2px; }
    .doc-title .sub { font-size:11px; color:#666; margin-top:3px; }
    .doc-title .law-ref { display:inline-block; font-size:10px; color:#2D7A3A; border:1px solid #C8E6C9; border-radius:4px; padding:2px 8px; margin-top:6px; }
    .status-bar { display:flex; justify-content:space-between; background:#E8F5E9; border-radius:8px; padding:8px 16px; margin-bottom:22px; font-size:11px; color:#333; }
    .status-bar strong { color:#2D7A3A; }
    .section { margin-bottom:20px; }
    .section-title { font-size:11px; font-weight:800; color:#fff; background:#2D7A3A; text-transform:uppercase; letter-spacing:1px; padding:5px 12px; border-radius:5px; margin-bottom:10px; display:inline-block; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
    .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
    .span2 { grid-column:span 2; }
    .field { background:#FAFFF9; border:1px solid #C8E6C9; border-radius:6px; padding:8px 12px; }
    .field.blue { background:#F0F8FF; border-color:#AED6F1; }
    .field label { font-size:9px; color:#888; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:3px; }
    .field span { font-size:13px; font-weight:600; color:#1B2B1C; }
    .price-block { background:#2D7A3A; color:#fff; border-radius:10px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
    .price-block .p-label { font-size:11px; opacity:0.85; margin-bottom:3px; }
    .price-block .p-value { font-size:24px; font-weight:800; }
    .price-block .p-formula { font-size:12px; opacity:0.75; margin-top:4px; }
    .price-block .p-rupee { font-size:44px; opacity:0.15; }
    .terms { border:1.5px solid #FDD835; background:#FFFDE7; border-radius:8px; padding:14px 16px; margin-bottom:20px; font-size:11.5px; }
    .terms .terms-title { font-weight:800; font-size:12px; color:#1B2B1C; margin-bottom:8px; }
    .terms ol { padding-left:18px; }
    .terms li { margin-bottom:5px; color:#333; }
    .dispute { background:#F3E5F5; border:1px solid #CE93D8; border-radius:8px; padding:12px 16px; margin-bottom:20px; font-size:11.5px; }
    .dispute .d-title { font-weight:800; font-size:12px; color:#4A148C; margin-bottom:6px; }
    .dispute p { color:#333; margin-bottom:4px; }
    .sig-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:10px; }
    .sig-box { border-top:2px solid #333; padding-top:8px; }
    .sig-space { height:40px; }
    .sig-box p { font-size:11px; color:#444; }
    .sig-box strong { font-size:12px; color:#1B2B1C; }
    .footer { text-align:center; font-size:9.5px; color:#bbb; margin-top:24px; border-top:1px solid #eee; padding-top:10px; }
    hr { border:none; border-top:1px solid #eee; margin:16px 0; }
  </style>
</head>
<body>

<div class="top-header">
  <div class="logo-block">
    <div class="logo">Krishi<span>-Mitra</span></div>
    <div class="tagline">Agricultural Finance &amp; Trade Platform</div>
  </div>
  <div class="meta-block">
    <div>Agreement ID: <strong>${agreementId}</strong></div>
    <div>Generated: <strong>${today}</strong></div>
    <div>Accepted: <strong>${d.acceptedAt ?? today}</strong></div>
    <div>Status: <strong style="color:#2D7A3A">&#10004; ACCEPTED</strong></div>
  </div>
</div>

<div class="doc-title">
  <h1>Agricultural Sale &amp; Purchase Agreement</h1>
  <div class="sub">This contract is executed under and governed by</div>
  <div class="law-ref">The Indian Contract Act, 1872 &nbsp;&middot;&nbsp; The Sale of Goods Act, 1930</div>
</div>

<div class="status-bar">
  <div>Deal Listed On: <strong>${d.createdAt ?? '&#8212;'}</strong></div>
  <div>Crop: <strong>${d.crop}</strong></div>
  <div>Quantity: <strong>${d.quantity}</strong></div>
  <div>Locked Price: <strong>${d.askPrice}</strong></div>
</div>

<div class="section">
  <div class="section-title">Party A &mdash; Farmer / Seller</div>
  <div class="grid2">
    <div class="field"><label>Full Name</label><span>${d.farmerName}</span></div>
    <div class="field"><label>Phone Number</label><span>${d.farmerPhone ? `+91 ${d.farmerPhone}` : '&#8212;'}</span></div>
    <div class="field span2"><label>Address / Location</label><span>${d.farmerAddress || '&#8212;'}</span></div>
    <div class="field"><label>Aadhaar Number (Masked)</label><span>${maskedAadhar}</span></div>
    <div class="field"><label>Role in Agreement</label><span>Seller / Producer</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title" style="background:#1A5276;">Party B &mdash; Dealer / Buyer</div>
  <div class="grid2">
    <div class="field blue"><label>Firm / Business Name</label><span>${d.dealerName}</span></div>
    <div class="field blue"><label>Contact Person</label><span>${d.dealerContact || d.dealerName}</span></div>
    <div class="field blue"><label>Business Type</label><span>${d.dealerBusinessType || '&#8212;'}</span></div>
    <div class="field blue"><label>Phone Number</label><span>${d.dealerPhone ? `+91 ${d.dealerPhone}` : '&#8212;'}</span></div>
    <div class="field blue"><label>Email Address</label><span>${d.dealerEmail || '&#8212;'}</span></div>
    <div class="field blue"><label>State / District</label><span>${d.dealerState || '&#8212;'}</span></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Subject of Contract &mdash; Commodity Details</div>
  <div class="grid3">
    <div class="field"><label>Crop / Commodity</label><span>${d.crop}</span></div>
    <div class="field"><label>Quantity</label><span>${d.quantity}</span></div>
    <div class="field"><label>Agreed Price</label><span style="color:#2D7A3A;font-weight:800;">${d.askPrice}</span></div>
    <div class="field"><label>Quality Standard</label><span>Grade A &mdash; Standard Market Norms</span></div>
    <div class="field"><label>Expected Harvest Date</label><span>${d.harvestDate || '&#8212;'}</span></div>
    <div class="field"><label>Delivery / Transport Date</label><span>${d.transportDate || '&#8212;'}</span></div>
    <div class="field span2"><label>Delivery Location</label><span>${d.deliveryLocation || d.farmerAddress || '&#8212;'}</span></div>
    <div class="field"><label>Deal Accepted On</label><span>${d.acceptedAt ?? today}</span></div>
  </div>
</div>

<div class="price-block">
  <div>
    <div class="p-label">AGREED / LOCKED PRICE</div>
    <div class="p-value">${d.askPrice}</div>
    <div class="p-formula">${d.farmerName} agrees to sell ${d.quantity} of ${d.crop} to ${d.dealerName} at the above price.</div>
  </div>
  <div class="p-rupee">&#8377;</div>
</div>

<div class="terms">
  <div class="terms-title">Terms &amp; Conditions</div>
  <ol>
    <li>The Farmer (Party A) agrees to supply <strong>${d.quantity}</strong> of <strong>${d.crop}</strong> (Grade A quality) to the Dealer (Party B) at the locked price of <strong>${d.askPrice}</strong>.</li>
    <li>The produce shall be ready for delivery / transport by <strong>${d.transportDate ?? 'the mutually agreed date'}</strong>.</li>
    <li>Quality of the produce must meet standard market norms (moisture content, grade, hygiene). Any significant deviation from Grade A standards may be grounds for price renegotiation subject to mutual consent.</li>
    <li>The Dealer (Party B) shall make payment to the Farmer (Party A) within <strong>7 (seven) working days</strong> of successful delivery and quality verification.</li>
    <li>Neither party shall transfer or assign this agreement to a third party without written consent of the other party.</li>
    <li>In case of crop failure due to natural calamity (flood, drought, pest), the Farmer must notify the Dealer at least <strong>15 days</strong> before the delivery date. The parties shall then renegotiate in good faith.</li>
    <li>This agreement shall be binding upon both parties from the date of digital confirmation on the Krishi-Mitra platform.</li>
    <li>Krishi-Mitra acts solely as a digital facilitator. It bears no financial liability for non-fulfilment, quality disputes, or payment defaults by either party.</li>
  </ol>
</div>

<div class="dispute">
  <div class="d-title">Dispute Resolution &amp; Governing Law</div>
  <p><strong>Governing Law:</strong> This agreement is governed by the laws of India, specifically the <strong>Indian Contract Act, 1872</strong> and the <strong>Sale of Goods Act, 1930</strong>.</p>
  <p><strong>Arbitration:</strong> Any dispute shall first be resolved amicably within 15 days of written notice. If unresolved, it shall be referred to a sole arbitrator under the <strong>Arbitration and Conciliation Act, 1996</strong>.</p>
  <p><strong>Jurisdiction:</strong> Courts at <strong>${jurisdiction}, India</strong> shall have exclusive jurisdiction over any legal proceedings under this agreement.</p>
</div>

<hr/>

<div class="sig-row">
  <div class="sig-box">
    <div class="sig-space"></div>
    <p><strong>${d.farmerName}</strong></p>
    <p>Farmer / Seller (Party A)</p>
    <p style="margin-top:3px;font-size:10px;color:#888;">${d.farmerPhone ? `+91 ${d.farmerPhone}` : '&#8212;'}</p>
  </div>
  <div class="sig-box">
    <div class="sig-space"></div>
    <p><strong>${d.dealerName}</strong></p>
    <p>Dealer / Buyer (Party B)</p>
    <p style="margin-top:3px;font-size:10px;color:#888;">${d.dealerEmail || (d.dealerPhone ? `+91 ${d.dealerPhone}` : '&#8212;')}</p>
  </div>
  <div class="sig-box">
    <div class="sig-space"></div>
    <p><strong>Authorised Signatory</strong></p>
    <p>Krishi-Mitra Platform</p>
    <p style="margin-top:3px;font-size:10px;color:#888;">platform@krishimitra.com</p>
  </div>
</div>

<div class="footer">
  Auto-generated by Krishi-Mitra &nbsp;&middot;&nbsp; Agreement ID: ${agreementId} &nbsp;&middot;&nbsp; ${today}<br/>
  Governed by The Indian Contract Act, 1872 &nbsp;&middot;&nbsp; Krishi-Mitra is a registered agricultural trade facilitation platform.
</div>

</body>
</html>`;
}
