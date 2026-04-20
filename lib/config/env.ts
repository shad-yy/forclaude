export const ENV = {
  get THESPORTSDB_KEY() {
    return process.env.THESPORTSDB_API_KEY || "123"
  },
  get NEWS_API_KEY() {
    return process.env.NEWS_API_KEY || "pub_f2cca2887ba748a1912c0e1a6f6f77d7"
  },
  get NEXT_PUBLIC_APP_URL() {
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  },
  get JWT_SECRET() {
    return process.env.JWT_SECRET || ""
  },
  get STORE_URL() {
    return process.env.NEXT_PUBLIC_STORE_URL || "https://smartlivetv.com/store"
  },
} as const
