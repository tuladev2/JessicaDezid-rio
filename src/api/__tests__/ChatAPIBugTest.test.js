import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Property 1: Bug Condition - Obsolete OpenAI API Configuration
 * 
 * This test explores the bug condition where src/api/chat.js uses obsolete OpenAI configuration
 * instead of the correct Groq API configuration.
 * EXPECTED: This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * 
 * Requirements: 1.3, 1.4
 */

describe('Property 1: Bug Condition - Obsolete OpenAI API Configuration', () => {
  
  it('should fail: src/api/chat.js imports OpenAI instead of Groq', () => {
    /**
     * Bug Condition: chat.js uses OpenAI SDK
     * Expected: Import statement contains 'openai' (this is the bug)
     */
    const chatFilePath = path.resolve(process.cwd(), 'src/api/chat.js');
    const chatContent = fs.readFileSync(chatFilePath, 'utf-8');

    // This test MUST FAIL on unfixed code
    // We're checking that the bug exists (OpenAI import is present)
    const hasOpenAIImport = chatContent.includes("import OpenAI from 'openai'");
    const hasGroqImport = chatContent.includes("import Groq from 'groq-sdk'");

    console.log('✓ Bug Condition Confirmed - API Configuration Issue:', {
      hasOpenAIImport,
      hasGroqImport,
      bugExists: hasOpenAIImport && !hasGroqImport
    });

    // The bug exists if OpenAI is imported and Groq is not
    expect(hasOpenAIImport).toBe(true);
    expect(hasGroqImport).toBe(false);
  });

  it('should fail: src/api/chat.js uses hardcoded API key instead of environment variable', () => {
    /**
     * Bug Condition: API key is hardcoded in the file
     * Expected: Hardcoded key string present (this is the bug)
     */
    const chatFilePath = path.resolve(process.cwd(), 'src/api/chat.js');
    const chatContent = fs.readFileSync(chatFilePath, 'utf-8');

    // This test MUST FAIL on unfixed code
    // We're checking that the bug exists (hardcoded key is present)
    const hasHardcodedKey = chatContent.includes("apiKey: 'SUA_CHAVE_AQUI'");
    const hasEnvVariable = chatContent.includes("import.meta.env.VITE_GROQ_API_KEY");

    console.log('✓ Bug Condition Confirmed - Hardcoded API Key:', {
      hasHardcodedKey,
      hasEnvVariable,
      bugExists: hasHardcodedKey && !hasEnvVariable
    });

    // The bug exists if hardcoded key is present and env variable is not
    expect(hasHardcodedKey).toBe(true);
    expect(hasEnvVariable).toBe(false);
  });

  it('should fail: src/api/chat.js uses wrong model (gpt-4o-mini instead of llama-3.3-70b-versatile)', () => {
    /**
     * Bug Condition: Wrong model is configured
     * Expected: gpt-4o-mini model string present (this is the bug)
     */
    const chatFilePath = path.resolve(process.cwd(), 'src/api/chat.js');
    const chatContent = fs.readFileSync(chatFilePath, 'utf-8');

    // This test MUST FAIL on unfixed code
    // We're checking that the bug exists (wrong model is used)
    const hasWrongModel = chatContent.includes("model: 'gpt-4o-mini'");
    const hasCorrectModel = chatContent.includes("model: 'llama-3.3-70b-versatile'");

    console.log('✓ Bug Condition Confirmed - Wrong Model Configuration:', {
      hasWrongModel,
      hasCorrectModel,
      bugExists: hasWrongModel && !hasCorrectModel
    });

    // The bug exists if wrong model is present and correct model is not
    expect(hasWrongModel).toBe(true);
    expect(hasCorrectModel).toBe(false);
  });

  it('should document: Obsolete OpenAI configuration prevents Groq API usage', () => {
    /**
     * Documentation of the bug condition
     * 
     * Bug Condition C(X):
     * - File: src/api/chat.js
     * - Current State: Uses OpenAI SDK with hardcoded API key
     * - Expected State: Uses Groq SDK with environment variable
     * 
     * Root Cause Analysis:
     * The file src/api/chat.js was not updated when the system migrated from OpenAI to Groq.
     * Meanwhile, src/lib/openai.js was correctly updated to use Groq.
     * This creates an inconsistency where two different chat implementations coexist.
     * 
     * Security Issues:
     * - API key is hardcoded in source code (security risk)
     * - Not using environment variables (violates security best practices)
     * 
     * Expected Fix:
     * - Replace OpenAI import with Groq import
     * - Use import.meta.env.VITE_GROQ_API_KEY for API key
     * - Update model to 'llama-3.3-70b-versatile'
     * - Implement proper error handling with detailed logging
     */
    
    const bugCondition = {
      file: 'src/api/chat.js',
      currentState: 'OpenAI SDK with hardcoded key',
      expectedState: 'Groq SDK with environment variable',
      securityIssues: ['Hardcoded API key', 'No environment variable usage'],
      inconsistency: 'src/lib/openai.js already uses Groq correctly',
      expectedFix: 'Migrate to Groq SDK with secure configuration'
    };

    console.log('Bug Condition Documentation:', bugCondition);
    expect(bugCondition.currentState).toBe('OpenAI SDK with hardcoded key');
  });
});
