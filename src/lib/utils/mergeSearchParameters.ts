import { SearchParameters } from '../../types';
import findIndex from './findIndex';

type Merger = (
  left: SearchParameters,
  right: SearchParameters
) => SearchParameters;

const mergeWithRest: Merger = (left, right) => {
  const {
    facets,
    disjunctiveFacets,
    facetsRefinements,
    facetsExcludes,
    disjunctiveFacetsRefinements,
    numericRefinements,
    tagRefinements,
    hierarchicalFacets,
    hierarchicalFacetsRefinements,
    ...rest
  } = right;

  return left.setQueryParameters(rest);
};

// Merge facets
const mergeFacets: Merger = (left, right) =>
  right.facets!.reduce((_, name) => _.addFacet(name), left);

const mergeDisjunctiveFacets: Merger = (left, right) =>
  right.disjunctiveFacets!.reduce(
    (_, name) => _.addDisjunctiveFacet(name),
    left
  );

const mergeTagRefinements: Merger = (left, right) =>
  right.tagRefinements!.reduce((_, value) => _.addTagRefinement(value), left);

type HierarchicalFacet = {
  name: string;
  attributes: string[];
  separator: string;
};

const mergeHierarchicalFacets: Merger = (left, right) =>
  left.setQueryParameters({
    // @TODO: remove this cast when typings in helper are merged
    hierarchicalFacets: (right.hierarchicalFacets as HierarchicalFacet[]).reduce(
      (facets, facet) => {
        const index = findIndex(facets, _ => _.name === facet.name);

        if (index === -1) {
          return facets.concat(facet);
        }

        const nextFacets = facets.slice();
        nextFacets.splice(index, 1, facet);

        return nextFacets;
      },
      left.hierarchicalFacets as HierarchicalFacet[]
    ),
  });

// Merge facets refinements
const mergeFacetRefinements: Merger = (left, right) =>
  left.setQueryParameters({
    facetsRefinements: {
      ...left.facetsRefinements,
      ...right.facetsRefinements,
    },
  });

const mergeFacetsExcludes: Merger = (left, right) =>
  left.setQueryParameters({
    facetsExcludes: {
      ...left.facetsExcludes,
      ...right.facetsExcludes,
    },
  });

const mergeDisjunctiveFacetsRefinements: Merger = (left, right) =>
  left.setQueryParameters({
    disjunctiveFacetsRefinements: {
      ...left.disjunctiveFacetsRefinements,
      ...right.disjunctiveFacetsRefinements,
    },
  });

const mergeNumericRefinements: Merger = (left, right) =>
  left.setQueryParameters({
    numericRefinements: {
      ...left.numericRefinements,
      ...right.numericRefinements,
    },
  });

const mergeHierarchicalFacetsRefinements: Merger = (left, right) =>
  left.setQueryParameters({
    hierarchicalFacetsRefinements: {
      ...left.hierarchicalFacetsRefinements,
      ...right.hierarchicalFacetsRefinements,
    },
  });

const merge = (...parameters: SearchParameters[]): SearchParameters =>
  parameters.reduce((left, right) => {
    const hierarchicalFacetsRefinementsMerged = mergeHierarchicalFacetsRefinements(
      left,
      right
    );
    const hierarchicalFacetsMerged = mergeHierarchicalFacets(
      hierarchicalFacetsRefinementsMerged,
      right
    );
    const tagRefinementsMerged = mergeTagRefinements(
      hierarchicalFacetsMerged,
      right
    );
    const numericRefinementsMerged = mergeNumericRefinements(
      tagRefinementsMerged,
      right
    );
    const disjunctiveFacetsRefinementsMerged = mergeDisjunctiveFacetsRefinements(
      numericRefinementsMerged,
      right
    );
    const facetsExcludesMerged = mergeFacetsExcludes(
      disjunctiveFacetsRefinementsMerged,
      right
    );
    const facetRefinementsMerged = mergeFacetRefinements(
      facetsExcludesMerged,
      right
    );
    const disjunctiveFacetsMerged = mergeDisjunctiveFacets(
      facetRefinementsMerged,
      right
    );
    const facetsMerged = mergeFacets(disjunctiveFacetsMerged, right);

    return mergeWithRest(facetsMerged, right);
  });

export default merge;