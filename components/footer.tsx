'use client'

import { Twitter, Github, Mail, Send } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">ShadowID</h3>
            <p className="text-sm text-muted-foreground">
              Privacy-first zero-knowledge identity on Aleo blockchain.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#use-cases" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Use Cases
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Developers</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#documentation" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#github" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="#api" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#contracts" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contracts
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#about" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#blog" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © 2026 ShadowID. Zero-knowledge identity for everyone.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {/* Twitter */}
            <a
              href="https://twitter.com/shadowid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>

            {/* Discord */}
            <a
              href="https://discord.gg/shadowid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
              aria-label="Discord"
            >
              <Send className="h-5 w-5" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/shadowid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent/80 transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>

            {/* Email */}
            <a
              href="mailto:hello@shadowid.xyz"
              className="text-accent hover:text-accent/80 transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
