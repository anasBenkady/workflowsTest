import * as dotenv from 'dotenv'
import * as findConfig from 'find-config'

const envPath = findConfig('.env')
dotenv.config({ path: envPath ?? undefined })

interface Config {
  rabbitmqurl: string
  client_cert: string
  client_key: string
  ca_cert: string
  passphrase: string

}

const config: Config = {
  rabbitmqurl: process.env.RABBITMQ_URL ?? 'amqps://localhost:5671',
  client_cert: process.env.RABBITMQ_CLIENT_CERTIFICATE ?? '',
  client_key: process.env.RABBITMQ_CLIENT_PRIVATE_KEY ?? '',
  ca_cert: process.env.RABBITMQ_CA_CERTIFICATE ?? '',
  passphrase: process.env.RABBITMQ_CERT_PASSWORD ?? ''
}

export default config
