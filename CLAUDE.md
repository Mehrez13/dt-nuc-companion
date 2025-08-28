# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a nuclear NDT (Non-Destructive Testing) companion application project called "DT NUC Companion". The project is currently in the planning/specification phase with detailed requirements outlined in `instruction.rtf`.

## Planned Architecture

Based on the technical specification:

### Mobile Application
- **Framework**: React Native
- **Platform**: Android tablets (primary), with field technician usage
- **Offline Storage**: SQLite/WatermelonDB for offline-first functionality
- **UI Considerations**: Must work with gloves and protective equipment (EPI)

### Web Application  
- **Framework**: React + TypeScript
- **Type**: PWA (Progressive Web App) with controlled caching
- **Offline**: Light offline capabilities

### Backend
- **Options**: Node.js (NestJS) or .NET
- **Database**: PostgreSQL (for production data)
- **Security**: High security requirements for nuclear industry compliance

## Domain Context

This application serves nuclear technicians (CND - Contrôle Non Destructif) working at EDF sites. Key requirements:

- **Offline-first**: Must work without network connectivity
- **Traceability**: Full audit trails required for nuclear compliance
- **Security**: Nuclear industry security standards
- **Field Usage**: Designed for harsh industrial environments
- **Document Management**: Access to DT NUC procedures and technical documents

## Development Guidelines

### Security Requirements
- Never expose or log secrets/API keys
- Implement comprehensive audit logging
- Follow nuclear industry security standards
- All data changes must be traceable

### Offline-First Design
- Prioritize offline functionality over online features
- Implement robust data synchronization
- Handle network interruptions gracefully
- Cache critical documents and procedures locally

### Industrial UI/UX
- Design for use with protective gloves
- High contrast, large touch targets
- Simple navigation for field conditions
- Quick access to critical information

## Current Status

**Project Phase**: Planning/Specification
- No code implementation yet
- Comprehensive technical specification available in `instruction.rtf`
- Architecture and technology stack defined
- Ready for development phase initiation

## Next Steps for Development

1. Initialize project structure based on chosen technology stack
2. Set up offline-first architecture with chosen database
3. Implement core document management system
4. Build field-optimized mobile UI
5. Implement security and audit logging
6. Create synchronization mechanisms