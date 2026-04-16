# Requirements Document

## Introduction

This feature involves migrating from Google's Generative AI library to OpenAI for the chat functionality and stabilizing the remaining panel tabs (Pacotes, Configurações) with proper database integration and improved user experience. The goal is to create a more reliable and feature-complete aesthetics management panel for Jessica Dezidério.

## Requirements

### Requirement 1: OpenAI Chat Integration

**User Story:** As Jessica, I want a reliable AI assistant powered by OpenAI that helps me with my aesthetics panel, so that I can get consistent technical support and guidance.

#### Acceptance Criteria

1. WHEN the system initializes THEN it SHALL use OpenAI's gpt-4o-mini model instead of Google's Generative AI
2. WHEN a user sends a chat message THEN the system SHALL respond using the OpenAI API with the specified API key
3. WHEN the AI responds THEN it SHALL identify itself as "Assistente Técnica da Nexvision Dev para a Jessica Dezidério"
4. WHEN technical support is needed THEN the system SHALL provide the WhatsApp contact: https://wa.me/5548992212770
5. WHEN the chat API is called THEN it SHALL maintain conversation context by passing all messages

### Requirement 2: Enhanced Packages Management

**User Story:** As Jessica, I want flexible package creation with editable session quantities and automatic calculations, so that I can customize packages for different client needs.

#### Acceptance Criteria

1. WHEN creating a package THEN the system SHALL allow free numeric input for session quantities instead of fixed "6x"
2. WHEN entering package details THEN the system SHALL NOT require client search in the registration form
3. WHEN package values are entered THEN the system SHALL automatically calculate: (Unit Value * Session Quantity) - Discount
4. WHEN a package is saved THEN it SHALL be stored in the pacotes_vendidos table in Supabase
5. WHEN the calculation updates THEN it SHALL display the result in real-time

### Requirement 3: Schedule Configuration Management

**User Story:** As Jessica, I want to configure my business hours and block specific dates, so that I can manage my availability and prevent bookings during holidays or events.

#### Acceptance Criteria

1. WHEN setting business hours THEN the system SHALL connect to Supabase configuration tables with default hours 09:00 - 19:00
2. WHEN selecting working days THEN the system SHALL save weekday preferences to the database
3. WHEN clicking "+ Adicionar" in date blocking THEN the system SHALL save new holidays or events to the database
4. WHEN viewing configurations THEN the system SHALL load existing settings from Supabase
5. WHEN configurations are updated THEN they SHALL be immediately saved to the database

### Requirement 4: System Stability and Clean Architecture

**User Story:** As a developer, I want a clean codebase without conflicting dependencies and proper mobile layout, so that the application is maintainable and works across all devices.

#### Acceptance Criteria

1. WHEN the system builds THEN it SHALL NOT reference @google/generative-ai library
2. WHEN the application loads THEN it SHALL use bg-[#FDF8F3] background consistently
3. WHEN viewed on mobile devices THEN the layout SHALL stack components properly
4. WHEN node_modules are checked THEN there SHALL be no unused Google AI dependencies
5. WHEN the OpenAI library is missing THEN the system SHALL install it automatically via npm install openai