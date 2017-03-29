import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import Stats from '../../components/Stats/Stats.js';
import connectStats from '../../connectors/stats/connectStats.js';
import defaultTemplates from './defaultTemplates.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-stats');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
  transformData,
}) => ({
  hitsPerPage,
  nbHits,
  nbPages,
  page,
  processingTimeMS,
  query,
  instantSearchInstance,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && nbHits === 0;

  ReactDOM.render(
    <Stats
      collapsible={collapsible}
      cssClasses={cssClasses}
      hitsPerPage={hitsPerPage}
      nbHits={nbHits}
      nbPages={nbPages}
      page={page}
      processingTimeMS={processingTimeMS}
      query={query}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
stats({
  container,
  [ templates.{header,body,footer} ],
  [ transformData.{body} ],
  [ autoHideContainer]
})`;

/**
 * Display various stats about the current search state
 * @function stats
 * @param  {string|DOMElement} $0.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [$0.templates] Templates to use for the widget
 * @param  {string|Function} [$0.templates.header=''] Header template
 * @param  {string|Function} [$0.templates.body] Body template, provided with `hasManyResults`,
 * `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbPages`, `page`, `processingTimeMS`, `query`
 * @param  {string|Function} [$0.templates.footer=''] Footer template
 * @param  {Function} [$0.transformData.body] Function to change the object passed to the `body` template
 * @param  {boolean} [$0.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [$0.cssClasses] CSS classes to add
 * @param  {string|string[]} [$0.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [$0.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [$0.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [$0.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [$0.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @return {Object} widget
 */
export default function stats({
  container,
  cssClasses: userCssClasses = {},
  autoHideContainer = true,
  collapsible = false,
  transformData,
  templates = defaultTemplates,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    header: cx(bem('header'), userCssClasses.header),
    root: cx(bem(null), userCssClasses.root),
    time: cx(bem('time'), userCssClasses.time),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeWidget = connectStats(specializedRenderer);
    return makeWidget();
  } catch (e) {
    throw new Error(usage);
  }
}