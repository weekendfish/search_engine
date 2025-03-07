'use client'

import Link from 'next/link'
import { FiBook, FiSearch, FiUsers, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import projectsData from '@/data/projectsData'
import siteMetadata from '@/data/siteMetadata'
import PostList from '@/components/PostList'
import IntroSection from '@/components/IntroSection'
import SearchForm from '@/components/search/SearchForm'
import SearchResults from '@/components/search/SearchResults'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SearchResult } from '@/components/search/SearchResult'
import Image from 'next/image'

interface Project {
  title: string
  href: string
  size?: number
  is_restricted: boolean
}

const MAX_DISPLAY = 5
const projects: Project[] = projectsData as Project[]

// Define search parameters interface
interface SearchParams {
  query: string
  domain?: string | null
  tag?: string | null
  year?: string | null
  region?: string | null
}

export default function LandingPage({ posts }) {
  const totalCollections = projectsData.length
  const totalSize = projectsData.reduce((sum, project) => sum + (project.size || 0), 0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num)
  }

  // Check if any search parameters exist
  const hasSearchParams = () => {
    return Boolean(
      searchParams.get('term') ||
        searchParams.get('domain') ||
        searchParams.get('tag') ||
        searchParams.get('year') ||
        searchParams.get('region')
    )
  }

  // Perform initial search with params
  const performInitialSearch = () => {
    const query = searchParams.get('term')
    const domain = searchParams.get('domain')
    const tag = searchParams.get('tag')
    const year = searchParams.get('year')
    const region = searchParams.get('region')

    if (query || domain || tag || year || region) {
      handleSearch({
        query: query || '', // ensure query is never undefined
        domain: domain || undefined,
        tag: tag || undefined,
        year: year || undefined,
        region: region || undefined,
      })
    }
  }

  // Update useEffect to use new functions
  useEffect(() => {
    if (hasSearchParams()) {
      performInitialSearch()
    }
  }, [searchParams])

  const handleSearch = async ({ query, domain, tag, year, region }: SearchParams) => {
    setError(null)
    setIsSearching(true)
    setResults([])
    setHasSearched(true)

    try {
      const params = new URLSearchParams({
        term: query,
        ...(domain && { domain }),
        ...(tag && { tag }),
        ...(year && { year }),
        ...(region && { region }),
      })

      router.push(`/?${params.toString()}`, { scroll: false })

      const response = await fetch(`/api/search?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Search failed')
      }
      const data: SearchResult[] = await response.json()
      setResults(data)
    } catch (err) {
      setError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Determine if we need to show the centered search view or the results view
  const showCenteredSearch = !hasSearched && !hasSearchParams();

  return (
    <div className="min-h-screen flex flex-col flex-grow">
        {/* Search Section */}
        <div className={`w-full ${showCenteredSearch ? 'flex flex-col justify-center' : 'pt-8'}`} 
             style={{ minHeight: showCenteredSearch ? 'calc(100vh - 300px)' : 'auto' }}>
          <div className="mx-auto w-full max-w-3xl px-6 lg:px-8">
            {showCenteredSearch && (
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  {siteMetadata.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {siteMetadata.description}
                </p>
              </div>
            )}
            
            <div className="rounded-lg bg-white dark:bg-gray-800 shadow-md p-6 mb-8">
              {!showCenteredSearch && (
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">资料搜索</h2>
                  <div className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">
                    实验性功能
                  </div>
                </div>
              )}
              
              <SearchForm
                onSearch={handleSearch}
                isSearching={isSearching}
                initialValues={{
                  query: searchParams.get('term') || '',
                  domain: searchParams.get('domain') || '',
                  tag: searchParams.get('tag') || '',
                  year: searchParams.get('year') || '',
                  region: searchParams.get('region') || '',
                }}
              />
              
              {/* Stats display below search in centered mode */}
              {showCenteredSearch && (
                <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <FiBook className="mr-2" />
                    <span>{formatNumber(totalCollections)} 个合集</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-2" />
                    <span>{formatNumber(totalSize)} 条记录</span>
                  </div>
                </div>
              )}
            </div>
            
            {hasSearchParams() && (
              <div className="mt-6">
                <SearchResults results={results} error={error} />
              </div>
            )}
          </div>
        </div>

        {/* Conditionally show the intro section and blogs only on the homepage or when there are no search results */}
        {(showCenteredSearch || (results.length === 0 && !isSearching)) && (
          <>
            <div className="py-12 mt-8">
              <IntroSection />
            </div>
            
            {/* Latest Blogs Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="space-y-2 pb-8 pt-6 md:space-y-5">
                  <h2 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl sm:leading-10 md:text-4xl md:leading-14">
                    最新博客
                  </h2>
                  <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
                    最新发布的内容
                  </p>
                </div>
                <PostList posts={posts} maxDisplay={MAX_DISPLAY} />
              </div>
            </div>
          </>
        )}

    </div>
  )
}
