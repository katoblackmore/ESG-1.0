import React, { useEffect, useMemo, useRef, useState } from "react";

type FormData = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  companyName: string;
  officePhone: string;
  mobilePhone: string;
  websiteUrl: string;
  emailAddress: string;
  address: string;
  logoUrl: string;
  logoDataUrl: string;
  linkedin: string;
  facebook: string;
  twitter: string;
  instagram: string;
  whatsapp: string;
  legal: string;
};

const DEFAULTS: FormData = {
  firstName: "",
  lastName: "",
  jobTitle: "",
  department: "",
  companyName: "",
  officePhone: "",
  mobilePhone: "",
  websiteUrl: "",
  emailAddress: "",
  address: "",
  logoUrl: "",
  logoDataUrl: "",
  linkedin: "",
  facebook: "",
  twitter: "",
  instagram: "",
  whatsapp: "",
  legal: "",
};

const DEMO_DATA: FormData = {
  firstName: "Alex",
  lastName: "Johnson",
  jobTitle: "Senior Product Designer",
  department: "Fintech & Payments",
  companyName: "Acme Payments Inc.",
  officePhone: "+1 212 555 0199",
  mobilePhone: "+1 917 555 0421",
  websiteUrl: "acmepayments.com",
  emailAddress: "alex.johnson@acmepayments.com",
  address: "350 Fifth Avenue, New York, NY, USA",
  logoUrl: "",
  logoDataUrl: "",
  linkedin: "https://linkedin.com/in/alexjohnson",
  facebook: "https://facebook.com/alex.johnson",
  twitter: "https://x.com/alexjohnson",
  instagram: "https://instagram.com/alexjohnson",
  whatsapp: "https://wa.me/19175550421",
  legal:
    "This email and any attachments are confidential and intended solely for the addressee. If you have received this message in error, please notify the sender and delete it immediately.",
};

function iconDataUri(svg: string) {
  const encoded = encodeURIComponent(svg).replace(/%0A/g, "").replace(/%20/g, " ");
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function makeSocialIcons(stroke: string) {
  const mk = (txt: string, size = 9) =>
    iconDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <rect x="2.5" y="2.5" width="19" height="19" rx="6" fill="none" stroke="${stroke}" stroke-width="1.5"/>
  <text x="12" y="14.1" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="700" fill="${stroke}">${txt}</text>
</svg>`);

  return {
    linkedin: mk("in"),
    facebook: mk("f"),
    twitter: mk("X"),
    instagram: mk("ig"),
    whatsapp: mk("wa", 8.5),
  } as const;
}

const SOCIAL_LIGHT = makeSocialIcons("#6b7280");
const SOCIAL_DARK = makeSocialIcons("#cbd5e1");

const DEMO_LOGO = iconDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect x="6" y="6" width="84" height="84" rx="18" fill="none" stroke="#111827" stroke-width="3"/>
  <path d="M28 60V34h12c7 0 12 4 12 13s-5 13-12 13H28Zm8-7h4c4 0 6-2 6-6s-2-6-6-6h-4v12Z" fill="#111827"/>
  <path d="M56 60V34h8v19h10v7H56Z" fill="#111827"/>
</svg>`);

function normalizeUrl(raw: string) {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^(mailto:|tel:|https?:\/\/)/i.test(v)) return v;
  return `https://${v}`;
}

function escapeHtml(str: string) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

type SignatureLayout = "classic" | "elegant" | "horizontal" | "minimal" | "bold";

type BuildOpts = { theme?: "light" | "dark"; layout?: SignatureLayout };

const SIGNATURE_LAYOUTS: { id: SignatureLayout; name: string }[] = [
  { id: "classic", name: "Classic" },
  { id: "elegant", name: "Elegant" },
  { id: "horizontal", name: "Horizontal" },
  { id: "minimal", name: "Minimal" },
  { id: "bold", name: "Bold" },
];

function buildSignatureHTML(data: FormData, opts: BuildOpts = {}) {
  const theme = opts.theme === "dark" ? "dark" : "light";
  const layout: SignatureLayout = opts.layout || "classic";
  const SOCIAL = theme === "dark" ? SOCIAL_DARK : SOCIAL_LIGHT;

  const font = "Arial, Helvetica, sans-serif";
  const black = theme === "dark" ? "#f8fafc" : "#111827";
  const gray600 = theme === "dark" ? "#e5e7eb" : "#4b5563";
  const gray500 = theme === "dark" ? "#cbd5e1" : "#6b7280";
  const gray400 = theme === "dark" ? "#94a3b8" : "#9ca3af";
  const accent = theme === "dark" ? "#818cf8" : "#4f46e5";
  const dividerColor = theme === "dark" ? "#334155" : "#e5e7eb";

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  const jobLine = [data.jobTitle, data.department].filter(Boolean).join(" \u2022 ").trim();

  const company = String(data.companyName || "").trim();
  const officePhone = String(data.officePhone || "").trim();
  const mobilePhone = String(data.mobilePhone || "").trim();
  const email = String(data.emailAddress || "").trim();
  const websiteUrl = String(data.websiteUrl || "").trim();
  const address = String(data.address || "").trim();

  const logoSrc =
    String(data.logoDataUrl || "").trim() ||
    (String(data.logoUrl || "").trim() ? normalizeUrl(data.logoUrl) : "");
  const website = websiteUrl ? normalizeUrl(websiteUrl) : "";

  const socials = [
    { key: "linkedin", label: "LinkedIn", url: normalizeUrl(data.linkedin) },
    { key: "facebook", label: "Facebook", url: normalizeUrl(data.facebook) },
    { key: "twitter", label: "X", url: normalizeUrl(data.twitter) },
    { key: "instagram", label: "Instagram", url: normalizeUrl(data.instagram) },
    { key: "whatsapp", label: "WhatsApp", url: normalizeUrl(data.whatsapp) },
  ].filter((s) => !!s.url);

  const baseTd = `font-family:${font}; text-align:left; mso-line-height-rule:exactly; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;`;

  const officeHtml = officePhone
    ? `<a href="tel:${escapeHtml(officePhone)}" style="color:${gray600}; text-decoration:none;">${escapeHtml(officePhone)}</a>`
    : "";

  const mobileHtml = mobilePhone
    ? `<a href="tel:${escapeHtml(mobilePhone)}" style="color:${gray600}; text-decoration:none;">${escapeHtml(mobilePhone)}</a>`
    : "";

  const emailHtml = email
    ? `<a href="mailto:${escapeHtml(email)}" style="color:${gray600}; text-decoration:none;">${escapeHtml(email)}</a>`
    : "";

  const webHtml = website
    ? `<a href="${escapeHtml(website)}" style="color:${gray600}; text-decoration:none;">${escapeHtml(
        website.replace(/^https?:\/\//i, "")
      )}</a>`
    : "";

  const addressHtml = address ? `<span style="color:${gray600};">${escapeHtml(address)}</span>` : "";

  const legal = String(data.legal || "").trim();

  const socialsHtml = socials.length > 0
    ? socials
        .map(
          (s) =>
            `<td style="padding-right:8px;"><a href="${escapeHtml(
              s.url
            )}" style="text-decoration:none;" target="_blank" rel="noopener noreferrer"><img src="${SOCIAL[
              s.key as keyof typeof SOCIAL
            ]}" width="24" height="24" style="display:block; border:0; outline:none; text-decoration:none;" alt="${escapeHtml(
              s.label
            )}" /></a></td>`
        )
        .join("")
    : "";

  const socialsRow = socialsHtml
    ? `<tr><td style="padding-top:10px; ${baseTd}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}"><tr>${socialsHtml}</tr></table></td></tr>`
    : "";

  const legalRow = legal
    ? `<tr><td style="padding-top:12px; ${baseTd} font-size:11px; line-height:15px; color:${gray400}; max-width:420px;">${escapeHtml(legal).replace(/\n/g, "<br/>")}</td></tr>`
    : "";

  // Helper for contact detail rows
  const row = (html: string, labelPrefix?: string) => {
    if (!html) return "";
    const prefix = labelPrefix ? `<span style="color:${gray500};">${labelPrefix}:</span> ` : "";
    return `<tr><td style="padding:2px 0; ${baseTd} font-size:14px; line-height:18px; color:${gray600};">${prefix}${html}</td></tr>`;
  };

  const contactRows = [
    row(officeHtml, "Office"),
    row(mobileHtml, "Mobile"),
    row(emailHtml),
    row(webHtml),
    row(addressHtml),
  ].filter(Boolean).join("");

  // ─── CLASSIC ──────────────────────────────────────────────
  if (layout === "classic") {
    const headerBlock = logoSrc
      ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}"><tr>
          <td style="vertical-align:top; padding-right:12px;"><img src="${escapeHtml(logoSrc)}" width="48" height="48" style="display:block; border:0; outline:none; text-decoration:none; border-radius:10px;" alt="" /></td>
          <td style="vertical-align:top; ${baseTd}">
            ${fullName ? `<div style="${baseTd} font-size:18px; line-height:22px; font-weight:700; color:${black};">${escapeHtml(fullName)}</div>` : ""}
            ${jobLine ? `<div style="${baseTd} padding-top:2px; font-size:14px; line-height:18px; color:${gray600};">${escapeHtml(jobLine)}</div>` : ""}
            ${company ? `<div style="${baseTd} padding-top:2px; font-size:14px; line-height:18px; color:${gray400};">${escapeHtml(company)}</div>` : ""}
          </td></tr></table>`
      : `${fullName ? `<div style="${baseTd} font-size:18px; line-height:22px; font-weight:700; color:${black};">${escapeHtml(fullName)}</div>` : ""}
         ${jobLine ? `<div style="${baseTd} padding-top:2px; font-size:14px; line-height:18px; color:${gray600};">${escapeHtml(jobLine)}</div>` : ""}
         ${company ? `<div style="${baseTd} padding-top:2px; font-size:14px; line-height:18px; color:${gray400};">${escapeHtml(company)}</div>` : ""}`;

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}"><tr><td style="padding:0; ${baseTd}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">
        <tr><td style="padding:0; ${baseTd}">${headerBlock}</td></tr>
        <tr><td style="padding-top:10px; ${baseTd}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">${contactRows}</table></td></tr>
        ${socialsRow}
        ${legalRow}
      </table></td></tr></table>`.trim();
  }

  // ─── ELEGANT ──────────────────────────────────────────────
  // Left border accent line, refined typography
  if (layout === "elegant") {
    const nameBlock = `
      ${fullName ? `<div style="${baseTd} font-size:20px; line-height:24px; font-weight:700; color:${black}; letter-spacing:-0.02em;">${escapeHtml(fullName)}</div>` : ""}
      ${jobLine ? `<div style="${baseTd} padding-top:4px; font-size:13px; line-height:17px; color:${gray500}; text-transform:uppercase; letter-spacing:0.05em;">${escapeHtml(jobLine)}</div>` : ""}
      ${company ? `<div style="${baseTd} padding-top:2px; font-size:13px; line-height:17px; color:${gray400};">${escapeHtml(company)}</div>` : ""}`;

    const logoBlock = logoSrc
      ? `<tr><td style="padding-bottom:10px; ${baseTd}"><img src="${escapeHtml(logoSrc)}" width="44" height="44" style="display:block; border:0; outline:none; text-decoration:none; border-radius:10px;" alt="" /></td></tr>`
      : "";

    const contactInline = [officeHtml, mobileHtml, emailHtml, webHtml].filter(Boolean);
    const contactSeparated = contactInline.join(`<span style="color:${gray400}; padding:0 6px;">\u2022</span>`);

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}"><tr>
      <td style="border-left:3px solid ${accent}; padding-left:14px; ${baseTd}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">
          ${logoBlock}
          <tr><td style="${baseTd}">${nameBlock}</td></tr>
          ${contactSeparated ? `<tr><td style="padding-top:10px; ${baseTd} font-size:13px; line-height:17px; color:${gray600};">${contactSeparated}</td></tr>` : ""}
          ${addressHtml ? `<tr><td style="padding-top:2px; ${baseTd} font-size:13px; line-height:17px; color:${gray600};">${addressHtml}</td></tr>` : ""}
          ${socialsRow}
          ${legalRow}
        </table>
      </td></tr></table>`.trim();
  }

  // ─── HORIZONTAL ───────────────────────────────────────────
  // Logo on left, vertical divider, info on right — all in one row
  if (layout === "horizontal") {
    const leftCol = logoSrc
      ? `<td style="vertical-align:top; padding-right:14px; ${baseTd}"><img src="${escapeHtml(logoSrc)}" width="56" height="56" style="display:block; border:0; outline:none; text-decoration:none; border-radius:12px;" alt="" /></td>
         <td style="width:1px; background:${dividerColor}; font-size:0; line-height:0;" width="1">&nbsp;</td>`
      : `<td style="width:3px; background:${dividerColor}; font-size:0; line-height:0;" width="3">&nbsp;</td>`;

    const phoneItems = [
      officePhone ? `Office: ${escapeHtml(officePhone)}` : "",
      mobilePhone ? `Mobile: ${escapeHtml(mobilePhone)}` : "",
    ].filter(Boolean).join(" | ");

    const rightContent = `
      ${fullName ? `<div style="${baseTd} font-size:17px; line-height:21px; font-weight:700; color:${black};">${escapeHtml(fullName)}</div>` : ""}
      ${jobLine ? `<div style="${baseTd} padding-top:1px; font-size:13px; line-height:17px; color:${gray600};">${escapeHtml(jobLine)}</div>` : ""}
      ${company ? `<div style="${baseTd} padding-top:1px; font-size:13px; line-height:17px; color:${gray400};">${escapeHtml(company)}</div>` : ""}
      ${phoneItems ? `<div style="${baseTd} padding-top:8px; font-size:12px; line-height:16px; color:${gray500};">${phoneItems}</div>` : ""}
      ${email ? `<div style="${baseTd} padding-top:1px; font-size:12px; line-height:16px;"><a href="mailto:${escapeHtml(email)}" style="color:${gray600}; text-decoration:none;">${escapeHtml(email)}</a></div>` : ""}
      ${website ? `<div style="${baseTd} padding-top:1px; font-size:12px; line-height:16px;"><a href="${escapeHtml(website)}" style="color:${gray600}; text-decoration:none;">${escapeHtml(website.replace(/^https?:\/\//i, ""))}</a></div>` : ""}
      ${address ? `<div style="${baseTd} padding-top:1px; font-size:12px; line-height:16px; color:${gray500};">${escapeHtml(address)}</div>` : ""}`;

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}"><tr>
      ${leftCol}
      <td style="vertical-align:top; padding-left:14px; ${baseTd}">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">
          <tr><td style="${baseTd}">${rightContent}</td></tr>
          ${socialsRow}
          ${legalRow}
        </table>
      </td></tr></table>`.trim();
  }

  // ─── MINIMAL ──────────────────────────────────────────────
  // Ultra-clean: name, one-line info, socials
  if (layout === "minimal") {
    const infoItems = [email, websiteUrl ? website.replace(/^https?:\/\//i, "") : "", officePhone || mobilePhone].filter(Boolean);
    const infoLine = infoItems.map(i => `<span style="color:${gray600};">${escapeHtml(i)}</span>`).join(`<span style="color:${gray400}; padding:0 6px;">|</span>`);

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">
      <tr><td style="${baseTd}">
        <div style="${baseTd} font-size:16px; line-height:20px; font-weight:700; color:${black};">${escapeHtml(fullName || "Your Name")}</div>
        ${jobLine || company ? `<div style="${baseTd} padding-top:2px; font-size:13px; line-height:17px; color:${gray500};">${escapeHtml([jobLine, company].filter(Boolean).join(" \u2014 "))}</div>` : ""}
        <tr><td style="padding-top:6px; ${baseTd}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="height:1px; background:${dividerColor}; font-size:0; line-height:0;" colspan="1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td></tr></table></td></tr>
        ${infoLine ? `<tr><td style="padding-top:6px; ${baseTd} font-size:12px; line-height:16px;">${infoLine}</td></tr>` : ""}
        ${socialsRow}
        ${legalRow}
      </td></tr></table>`.trim();
  }

  // ─── BOLD ─────────────────────────────────────────────────
  // Large name, colored accent, compact info block
  if (layout === "bold") {
    const logoBlock = logoSrc
      ? `<td style="vertical-align:middle; padding-right:14px; ${baseTd}"><img src="${escapeHtml(logoSrc)}" width="52" height="52" style="display:block; border:0; outline:none; text-decoration:none; border-radius:12px;" alt="" /></td>`
      : "";

    const detailItems = [officeHtml, mobileHtml, emailHtml, webHtml, addressHtml].filter(Boolean);
    const detailRows = detailItems.map(item => `<tr><td style="padding:1px 0; ${baseTd} font-size:13px; line-height:17px; color:${gray600};">${item}</td></tr>`).join("");

    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">
      <tr>
        ${logoBlock}
        <td style="vertical-align:middle; ${baseTd}">
          <div style="${baseTd} font-size:22px; line-height:26px; font-weight:800; color:${black}; letter-spacing:-0.03em;">${escapeHtml(fullName || "Your Name")}</div>
          ${jobLine ? `<div style="${baseTd} padding-top:2px; font-size:14px; line-height:18px; color:${accent}; font-weight:600;">${escapeHtml(jobLine)}</div>` : ""}
          ${company ? `<div style="${baseTd} padding-top:1px; font-size:13px; line-height:17px; color:${gray400};">${escapeHtml(company)}</div>` : ""}
        </td>
      </tr>
      <tr><td ${logoBlock ? 'colspan="2"' : ""} style="padding-top:8px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr><td style="height:2px; background:${accent}; font-size:0; line-height:0; width:40px;" width="40">&nbsp;</td><td style="height:2px; background:${dividerColor}; font-size:0; line-height:0; width:200px;" width="200">&nbsp;</td></tr></table></td></tr>
      ${detailRows ? `<tr><td ${logoBlock ? 'colspan="2"' : ""} style="padding-top:8px; ${baseTd}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}">${detailRows}</table></td></tr>` : ""}
      ${socialsHtml ? `<tr><td ${logoBlock ? 'colspan="2"' : ""} style="padding-top:10px; ${baseTd}"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; ${baseTd}"><tr>${socialsHtml}</tr></table></td></tr>` : ""}
      ${legal ? `<tr><td ${logoBlock ? 'colspan="2"' : ""} style="padding-top:12px; ${baseTd} font-size:11px; line-height:15px; color:${gray400}; max-width:420px;">${escapeHtml(legal).replace(/\n/g, "<br/>")}</td></tr>` : ""}
    </table>`.trim();
  }

  // fallback — classic
  return buildSignatureHTML(data, { ...opts, layout: "classic" });
}

/* ─── Mini SVG thumbnails for theme picker ────────────────── */
function LayoutThumb({ layout }: { layout: SignatureLayout }) {
  const w = 160;
  const h = 100;
  const bar = "#6b7280";
  const line = "#9ca3af";
  const faint = "#d1d5db";

  if (layout === "classic") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect x="12" y="12" width="20" height="20" rx="5" fill={faint} />
        <rect x="38" y="12" width="50" height="6" rx="2" fill={bar} />
        <rect x="38" y="22" width="36" height="4" rx="1.5" fill={line} />
        <rect x="38" y="30" width="28" height="4" rx="1.5" fill={faint} />
        <rect x="12" y="42" width="44" height="3" rx="1.5" fill={line} />
        <rect x="12" y="49" width="48" height="3" rx="1.5" fill={line} />
        <rect x="12" y="56" width="60" height="3" rx="1.5" fill={faint} />
        <rect x="12" y="68" width="10" height="10" rx="3" fill={faint} />
        <rect x="25" y="68" width="10" height="10" rx="3" fill={faint} />
        <rect x="38" y="68" width="10" height="10" rx="3" fill={faint} />
        <rect x="12" y="84" width="90" height="2" rx="1" fill={faint} opacity="0.5" />
      </svg>
    );
  }

  if (layout === "elegant") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect x="12" y="8" width="3" height="82" rx="1.5" fill="#4f46e5" />
        <rect x="22" y="10" width="18" height="18" rx="5" fill={faint} />
        <rect x="22" y="34" width="56" height="6" rx="2" fill={bar} />
        <rect x="22" y="44" width="40" height="3.5" rx="1.5" fill={line} />
        <rect x="22" y="51" width="32" height="3.5" rx="1.5" fill={faint} />
        <rect x="22" y="62" width="80" height="3" rx="1.5" fill={line} />
        <rect x="22" y="69" width="60" height="3" rx="1.5" fill={faint} />
        <rect x="22" y="80" width="10" height="10" rx="3" fill={faint} />
        <rect x="35" y="80" width="10" height="10" rx="3" fill={faint} />
      </svg>
    );
  }

  if (layout === "horizontal") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect x="12" y="20" width="28" height="28" rx="7" fill={faint} />
        <rect x="44" y="20" width="1" height="60" fill={line} />
        <rect x="52" y="20" width="52" height="6" rx="2" fill={bar} />
        <rect x="52" y="30" width="36" height="3.5" rx="1.5" fill={line} />
        <rect x="52" y="37" width="28" height="3.5" rx="1.5" fill={faint} />
        <rect x="52" y="48" width="44" height="3" rx="1.5" fill={line} />
        <rect x="52" y="55" width="56" height="3" rx="1.5" fill={faint} />
        <rect x="52" y="62" width="40" height="3" rx="1.5" fill={faint} />
        <rect x="52" y="72" width="10" height="10" rx="3" fill={faint} />
        <rect x="65" y="72" width="10" height="10" rx="3" fill={faint} />
        <rect x="78" y="72" width="10" height="10" rx="3" fill={faint} />
      </svg>
    );
  }

  if (layout === "minimal") {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
        <rect x="12" y="18" width="56" height="6" rx="2" fill={bar} />
        <rect x="12" y="28" width="72" height="3.5" rx="1.5" fill={line} />
        <rect x="12" y="40" width="120" height="1" fill={faint} />
        <rect x="12" y="48" width="80" height="3" rx="1.5" fill={line} />
        <rect x="12" y="60" width="10" height="10" rx="3" fill={faint} />
        <rect x="25" y="60" width="10" height="10" rx="3" fill={faint} />
        <rect x="38" y="60" width="10" height="10" rx="3" fill={faint} />
        <rect x="12" y="78" width="100" height="2" rx="1" fill={faint} opacity="0.5" />
      </svg>
    );
  }

  // bold
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      <rect x="12" y="10" width="24" height="24" rx="6" fill={faint} />
      <rect x="42" y="10" width="64" height="8" rx="2.5" fill={bar} />
      <rect x="42" y="22" width="40" height="4" rx="1.5" fill="#4f46e5" />
      <rect x="42" y="30" width="30" height="3.5" rx="1.5" fill={faint} />
      <rect x="12" y="42" width="40" height="2" rx="1" fill="#4f46e5" />
      <rect x="52" y="42" width="60" height="2" rx="1" fill={faint} />
      <rect x="12" y="52" width="48" height="3" rx="1.5" fill={line} />
      <rect x="12" y="59" width="56" height="3" rx="1.5" fill={line} />
      <rect x="12" y="66" width="40" height="3" rx="1.5" fill={faint} />
      <rect x="12" y="78" width="10" height="10" rx="3" fill={faint} />
      <rect x="25" y="78" width="10" height="10" rx="3" fill={faint} />
      <rect x="38" y="78" width="10" height="10" rx="3" fill={faint} />
    </svg>
  );
}

function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm font-semibold text-zinc-100">{children}</div>
      {right}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  inputMode,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs text-zinc-400 mb-2">
        {label}
        {required ? <span className="text-zinc-500"> *</span> : null}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={!!error}
        className={`w-full rounded-xl bg-zinc-950/60 border px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 transition-all duration-200 hover:border-white/25 hover:bg-zinc-950/70 ${
          error ? "border-red-400/60 focus:ring-red-400/20" : "border-white/10 focus:ring-white/20"
        }`}
      />
      {error ? <div className="mt-1 text-[11px] text-red-300">{error}</div> : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <div className="text-xs text-zinc-400 mb-2">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl bg-zinc-950/60 border border-white/10 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 hover:border-white/25 hover:bg-zinc-950/70"
      />
    </label>
  );
}

function isEmail(v: string) {
  const s = String(v || "").trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(s);
}

function isPhone(v: string) {
  const s = String(v || "").trim();
  if (!s) return true;
  return /^[+()\-\s\d]{6,}$/.test(s);
}

function isUrlOrDomain(v: string) {
  const s = String(v || "").trim();
  if (!s) return true;
  try {
    // eslint-disable-next-line no-new
    new URL(normalizeUrl(s));
    return true;
  } catch {
    return false;
  }
}

export default function App() {
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState<FormData>(DEFAULTS);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const [signatureLayout, setSignatureLayout] = useState<SignatureLayout>("classic");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showErrors, setShowErrors] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const toast = (msg: string) => setToastMsg(msg);

  useEffect(() => {
    if (!toastMsg) return;
    const t = window.setTimeout(() => setToastMsg(""), 1800);
    return () => window.clearTimeout(t);
  }, [toastMsg]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    const req2 = (v: string, label: string) => {
      const s = String(v || "").trim();
      if (!s) return `${label} is required`;
      if (s.length < 2) return "Enter at least 2 characters";
      return "";
    };

    e.firstName = req2(data.firstName, "First Name");
    e.lastName = req2(data.lastName, "Last Name");
    e.jobTitle = req2(data.jobTitle, "Job Title");
    e.companyName = req2(data.companyName, "Company Name");

    const em = String(data.emailAddress || "").trim();
    e.emailAddress = !em ? "Email Address is required" : isEmail(em) ? "" : "Enter a valid email";

    const dep = String(data.department || "").trim();
    e.department = dep && dep.length < 2 ? "Enter at least 2 characters" : "";

    const addr = String(data.address || "").trim();
    e.address = addr && addr.length < 4 ? "Enter at least 4 characters" : "";

    e.officePhone = isPhone(data.officePhone) ? "" : "Enter a valid phone number";
    e.mobilePhone = isPhone(data.mobilePhone) ? "" : "Enter a valid phone number";

    e.websiteUrl = isUrlOrDomain(data.websiteUrl) ? "" : "Enter a valid URL";
    e.logoUrl = isUrlOrDomain(data.logoUrl) ? "" : "Enter a valid URL";

    e.linkedin = isUrlOrDomain(data.linkedin) ? "" : "Enter a valid URL";
    e.facebook = isUrlOrDomain(data.facebook) ? "" : "Enter a valid URL";
    e.twitter = isUrlOrDomain(data.twitter) ? "" : "Enter a valid URL";
    e.instagram = isUrlOrDomain(data.instagram) ? "" : "Enter a valid URL";
    e.whatsapp = isUrlOrDomain(data.whatsapp) ? "" : "Enter a valid URL";

    return e;
  }, [data]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const requiredFields = useMemo(
    () => new Set(["firstName", "lastName", "jobTitle", "companyName", "emailAddress"]),
    []
  );

  const getError = (name: keyof FormData | string) => {
    const v = String((data as any)[name] || "").trim();
    const shouldShow = showErrors || touched[name];
    if (!shouldShow) return "";
    if (!requiredFields.has(name) && !v) return "";
    return errors[name] || "";
  };

  const markTouched = (name: keyof FormData | string) => setTouched((t) => ({ ...t, [name]: true }));

  const signatureHtml = useMemo(
    () => buildSignatureHTML(data, { theme: previewTheme, layout: signatureLayout }),
    [data, previewTheme, signatureLayout]
  );

  const previewDoc = useMemo(() => {
    const bg = previewTheme === "dark" ? "#0b0b0f" : "#ffffff";
    return `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body style="margin:0;padding:16px;background:${bg};">${signatureHtml}</body></html>`;
  }, [signatureHtml, previewTheme]);

  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();

  const buttonGhost =
    "text-xs text-zinc-300 hover:text-white rounded-lg px-2 py-1 border border-white/10 hover:border-white/20 transition-all duration-200 hover:bg-white/5";

  function clearAll() {
    setData(DEFAULTS);
    setTouched({});
    setShowErrors(false);
    toast("Cleared");
  }

  function fillDemo() {
    setData({ ...DEMO_DATA, logoUrl: "", logoDataUrl: DEMO_LOGO });
    setTouched({});
    setShowErrors(false);
    toast("Demo data filled");
  }

  function onPickLogo() {
    logoFileRef.current?.click();
  }

  function onLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setData((s) => ({ ...s, logoDataUrl: result, logoUrl: "" }));
      toast("Logo added");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function copyHtml() {
    setShowErrors(true);
    if (hasErrors) {
      toast("Fix validation errors");
      return;
    }

    try {
      await navigator.clipboard.writeText(signatureHtml);
      toast("HTML copied");
      return;
    } catch {
      // ignore
    }

    try {
      const ta = document.createElement("textarea");
      ta.value = signatureHtml;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      toast("HTML copied");
    } catch {
      toast("Copy failed — your browser blocked clipboard");
    }
  }

  async function copyRich() {
    setShowErrors(true);
    if (hasErrors) {
      toast("Fix validation errors");
      return;
    }

    try {
      const container = document.createElement("div");
      container.setAttribute("contenteditable", "true");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.opacity = "0";
      container.innerHTML = signatureHtml;
      document.body.appendChild(container);

      const range = document.createRange();
      range.selectNodeContents(container);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);

      const ok = document.execCommand("copy");

      sel?.removeAllRanges();
      document.body.removeChild(container);

      if (ok) {
        toast("Signature copied");
        return;
      }
    } catch {
      // ignore
    }

    try {
      const AnyClipboardItem = (globalThis as any).ClipboardItem as
        | (new (items: Record<string, Blob>) => ClipboardItem)
        | undefined;

      if (AnyClipboardItem && navigator.clipboard?.write) {
        const item = new AnyClipboardItem({
          "text/html": new Blob([signatureHtml], { type: "text/html" }),
          "text/plain": new Blob([signatureHtml], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
        toast("Signature copied");
        return;
      }
    } catch {
      // ignore
    }

    await copyHtml();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 right-10 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-10">
        <header className="mb-6 md:mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
            Gmail • Outlook • Apple Mail friendly
          </div>
          <h1 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">Email signature generator</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">Fill the form, preview instantly, then copy the signature.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
            <SectionTitle
              right={
                <div className="flex items-center gap-2 ml-auto justify-end">
                  <button onClick={clearAll} className={buttonGhost} type="button">
                    Clear all
                  </button>
                  <button onClick={fillDemo} className={buttonGhost} type="button">
                    Fill demo
                  </button>
                </div>
              }
            >
              Details
            </SectionTitle>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field
                label="First Name"
                required
                value={data.firstName}
                onChange={(v) => setData((s) => ({ ...s, firstName: v }))}
                onBlur={() => markTouched("firstName")}
                placeholder="John"
                error={getError("firstName")}
              />
              <Field
                label="Last Name"
                required
                value={data.lastName}
                onChange={(v) => setData((s) => ({ ...s, lastName: v }))}
                onBlur={() => markTouched("lastName")}
                placeholder="Doe"
                error={getError("lastName")}
              />
              <Field
                label="Job Title"
                required
                value={data.jobTitle}
                onChange={(v) => setData((s) => ({ ...s, jobTitle: v }))}
                onBlur={() => markTouched("jobTitle")}
                placeholder="Product Designer"
                error={getError("jobTitle")}
              />
              <Field
                label="Department"
                value={data.department}
                onChange={(v) => setData((s) => ({ ...s, department: v }))}
                onBlur={() => markTouched("department")}
                placeholder="Payments"
                error={getError("department")}
              />
              <Field
                label="Company Name"
                required
                value={data.companyName}
                onChange={(v) => setData((s) => ({ ...s, companyName: v }))}
                onBlur={() => markTouched("companyName")}
                placeholder="Your Company"
                error={getError("companyName")}
              />
              <Field
                label="Office Phone Number"
                value={data.officePhone}
                onChange={(v) => setData((s) => ({ ...s, officePhone: v }))}
                onBlur={() => markTouched("officePhone")}
                placeholder="+1 555 000 000"
                inputMode="tel"
                error={getError("officePhone")}
              />
              <Field
                label="Mobile Phone Number"
                value={data.mobilePhone}
                onChange={(v) => setData((s) => ({ ...s, mobilePhone: v }))}
                onBlur={() => markTouched("mobilePhone")}
                placeholder="+1 555 111 111"
                inputMode="tel"
                error={getError("mobilePhone")}
              />
              <Field
                label="Website URL"
                value={data.websiteUrl}
                onChange={(v) => setData((s) => ({ ...s, websiteUrl: v }))}
                onBlur={() => markTouched("websiteUrl")}
                placeholder="example.com"
                inputMode="url"
                error={getError("websiteUrl")}
              />
              <Field
                label="Email Address"
                required
                value={data.emailAddress}
                onChange={(v) => setData((s) => ({ ...s, emailAddress: v }))}
                onBlur={() => markTouched("emailAddress")}
                placeholder="name@company.com"
                inputMode="email"
                type="email"
                error={getError("emailAddress")}
              />
              <div className="md:col-span-2">
                <Field
                  label="Address"
                  value={data.address}
                  onChange={(v) => setData((s) => ({ ...s, address: v }))}
                  onBlur={() => markTouched("address")}
                  placeholder="Street, City, Country"
                  error={getError("address")}
                />
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle>Company Logo</SectionTitle>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="Logo URL"
                  value={data.logoUrl}
                  onChange={(v) => setData((s) => ({ ...s, logoUrl: v, logoDataUrl: "" }))}
                  onBlur={() => markTouched("logoUrl")}
                  placeholder="https://example.com/logo.png"
                  inputMode="url"
                  error={getError("logoUrl")}
                />
                <div className="block">
                  <div className="text-xs text-zinc-400 mb-2">Upload logo</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={onPickLogo} className={`${buttonGhost} px-3 py-2`}>
                      Choose file
                    </button>
                    <div className="text-xs text-zinc-500 truncate">{data.logoDataUrl ? "Selected" : "Optional"}</div>
                  </div>
                  <input
                    ref={logoFileRef}
                    type="file"
                    accept="image/*"
                    onChange={onLogoFileChange}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                Tip: hosted HTTPS logos are most compatible with Outlook. Uploaded logos use a data URL for preview and HTML.
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle>Enter Your Social Links</SectionTitle>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field
                  label="LinkedIn"
                  value={data.linkedin}
                  onChange={(v) => setData((s) => ({ ...s, linkedin: v }))}
                  onBlur={() => markTouched("linkedin")}
                  placeholder="linkedin.com/in/username"
                  inputMode="url"
                  error={getError("linkedin")}
                />
                <Field
                  label="Facebook"
                  value={data.facebook}
                  onChange={(v) => setData((s) => ({ ...s, facebook: v }))}
                  onBlur={() => markTouched("facebook")}
                  placeholder="facebook.com/username"
                  inputMode="url"
                  error={getError("facebook")}
                />
                <Field
                  label="X / Twitter"
                  value={data.twitter}
                  onChange={(v) => setData((s) => ({ ...s, twitter: v }))}
                  onBlur={() => markTouched("twitter")}
                  placeholder="x.com/username"
                  inputMode="url"
                  error={getError("twitter")}
                />
                <Field
                  label="Instagram"
                  value={data.instagram}
                  onChange={(v) => setData((s) => ({ ...s, instagram: v }))}
                  onBlur={() => markTouched("instagram")}
                  placeholder="instagram.com/username"
                  inputMode="url"
                  error={getError("instagram")}
                />
                <Field
                  label="WhatsApp"
                  value={data.whatsapp}
                  onChange={(v) => setData((s) => ({ ...s, whatsapp: v }))}
                  onBlur={() => markTouched("whatsapp")}
                  placeholder="wa.me/XXXXXXXXX"
                  inputMode="url"
                  error={getError("whatsapp")}
                />
              </div>
              <div className="mt-3 text-xs text-zinc-500">
                Tip: you can paste full links or just domains — the generator will add https:// when needed.
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle>Themes</SectionTitle>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {SIGNATURE_LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setSignatureLayout(l.id)}
                    className={`group relative flex flex-col items-center rounded-xl border p-2.5 transition-all duration-200 ${
                      signatureLayout === l.id
                        ? "border-white/30 bg-white/10 ring-1 ring-white/20"
                        : "border-white/10 bg-zinc-950/40 hover:border-white/20 hover:bg-white/5"
                    }`}
                  >
                    <div className="w-full overflow-hidden rounded-lg bg-zinc-900/80 p-1">
                      <LayoutThumb layout={l.id} />
                    </div>
                    <div className={`mt-2 text-[11px] font-medium transition-colors ${
                      signatureLayout === l.id ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}>
                      {l.name}
                    </div>
                    {signatureLayout === l.id && (
                      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5L4 7.5L8 3" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <SectionTitle>Legal</SectionTitle>
              <div className="mt-3">
                <TextArea
                  label="Legal Content"
                  value={data.legal}
                  onChange={(v) => setData((s) => ({ ...s, legal: v }))}
                  onBlur={() => markTouched("legal")}
                  placeholder="Confidentiality notice, disclaimer, etc."
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={copyRich}
                className="inline-flex items-center justify-center rounded-xl bg-white text-zinc-950 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-100 transition-all duration-200"
              >
                Copy (rich)
              </button>
              <button
                type="button"
                onClick={copyHtml}
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-zinc-100 hover:border-white/25 hover:bg-white/5 transition-all duration-200"
              >
                Copy HTML
              </button>
              <div className="sm:ml-auto text-xs text-zinc-500 flex items-center">
                {fullName ? `Previewing: ${fullName}` : "Fill fields to preview"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <SectionTitle
              right={
                <div className="flex items-center gap-3 ml-auto justify-end">
                  <div className="text-xs text-zinc-400">Live preview</div>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme((t) => (t === "dark" ? "light" : "dark"))}
                    className={`${buttonGhost} inline-flex items-center gap-2`}
                    aria-label="Toggle preview theme"
                  >
                    <span className="text-zinc-400">Theme</span>
                    <span
                      className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                        previewTheme === "dark" ? "bg-white/25" : "bg-white/10"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          previewTheme === "dark" ? "translate-x-3.5" : "translate-x-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              }
            >
              Signature live preview
            </SectionTitle>

            <div className="mt-4 rounded-2xl overflow-hidden border border-white/10">
              <iframe title="preview" className="w-full h-[420px] bg-transparent" srcDoc={previewDoc} />
            </div>

            <div className="mt-4">
              <SectionTitle right={<button type="button" onClick={copyHtml} className={buttonGhost}>Copy</button>}>
                Generated HTML
              </SectionTitle>
              <pre className="mt-3 max-h-56 overflow-auto rounded-2xl border border-white/10 bg-zinc-950/50 p-3 text-[11px] leading-4 text-zinc-200 whitespace-pre-wrap break-words">
                {signatureHtml}
              </pre>
            </div>
          </div>
        </div>

        {toastMsg ? (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-2 text-sm text-zinc-100 shadow-lg">
            {toastMsg}
          </div>
        ) : null}
      </div>
    </div>
  );
}
