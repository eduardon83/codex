/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import { normaliseLang, t, type Lang } from './i18n.ts'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  lang?: Lang | string
}

export const RecoveryEmail = ({ siteName, confirmationUrl, lang }: RecoveryEmailProps) => {
  const L = normaliseLang(lang)
  const s = t(L)
  return (
    <Html lang={L} dir="ltr">
      <Head />
      <Preview>{s.recovery_preview(siteName)}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{s.recovery_h1}</Heading>
          <Text style={text}>{s.recovery_text(siteName)}</Text>
          <Button style={button} href={confirmationUrl}>{s.recovery_button}</Button>
          <Text style={footer}>{s.recovery_footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 25px' }
const button = {
  backgroundColor: '#000000', color: '#ffffff', fontSize: '14px',
  borderRadius: '8px', padding: '12px 20px', textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
