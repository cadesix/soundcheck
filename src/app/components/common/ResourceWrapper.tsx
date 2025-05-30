import React from 'react';
import { ResourceState } from '../../types/resource';

interface ResourceWrapperProps<T> {
  resource: ResourceState<T>;
  loading?: React.ReactNode;
  empty?: React.ReactNode;
  error?: React.ReactNode;
  children: (data: T) => React.ReactNode;
}

function ResourceWrapper<T>({ resource, loading, empty, error, children }: ResourceWrapperProps<T>) {
  if (resource.status === 'loading') return <>{loading || <div className="loading">Loading…</div>}</>;
  if (resource.status === 'error') return <>{error || <div className="error">{resource.error}</div>}</>;
  if (resource.status === 'empty') return <>{empty || <div>No data found.</div>}</>;
  if (resource.status === 'loaded') return <>{children(resource.data)}</>;
  return null;
}

export default ResourceWrapper; 