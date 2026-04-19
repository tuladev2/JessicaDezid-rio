// Test setup file
import { beforeEach, vi } from 'vitest'

// Mock environment variables
beforeEach(() => {
  // Mock Supabase environment variables
  vi.stubEnv('VITE_SUPABASE_URL', 'https://dlhkzsgnklkqddsozwcy.supabase.co')
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaGt6c2dua2xrcWRkc296d2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMTcyNTAsImV4cCI6MjA5MTc5MzI1MH0.VMHV7zNub59EefULZcUxmTqILUj8eFkmP8U5k6Zwy-E')
  vi.stubEnv('VITE_GROQ_API_KEY', 'gsk_test_placeholder_key_for_testing')
})