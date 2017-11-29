import cs from 'classnames'
import _ from 'lodash'
import React, { Component } from 'react'
import { observer } from 'mobx-react'
import Loader from 'react-loader'

import ipc from '../lib/ipc'
import projectsApi from '../projects/projects-api'
import specsStore from './specs-store'

@observer
class Specs extends Component {
  render () {
    if (specsStore.isLoading) return <Loader color='#888' scale={0.5}/>

    if (!specsStore.specs.length) return this._empty()

    let allActiveClass = specsStore.allSpecsChosen ? 'active' : ''

    return (
      <div id='tests-list-page'>
        <a onClick={this._selectSpec('__all')} className={`all-tests btn btn-link ${allActiveClass}`}>
          <i className={`fa fa-fw ${this._allSpecsIcon(specsStore.allSpecsChosen)}`}></i>{' '}
          Run All Tests
        </a>
        <ul className='outer-files-container list-as-table'>
          {_.map(specsStore.specs, (spec) => (
            this._specItem(spec)
          ))}
        </ul>
      </div>
    )
  }

  _specItem (spec) {
    if (spec.hasChildren()) {
      return this._folderContent(spec)
    } else {
      return this._specContent(spec)
    }
  }

  _allSpecsIcon (allSpecsChosen) {
    if (allSpecsChosen) {
      return 'fa-dot-circle-o green'
    } else {
      return 'fa-play'
    }
  }

  _specIcon (isChosen) {
    if (isChosen) {
      return 'fa-dot-circle-o green'
    } else {
      return 'fa-file-code-o'
    }
  }

  _selectSpec = (specPath) => (e) => {
    e.preventDefault()

    specsStore.setChosenSpec(specPath)

    let project = this.props.project

    projectsApi.runSpec(project, specPath, project.chosenBrowser.name)
  }

  _selectSpecFolder = (specFolderPath) => (e) => {
    e.preventDefault()

    specsStore.setExpandSpecFolder(specFolderPath)
  }

  _folderContent (spec) {
    const isExpanded = spec.isExpanded

    return (
      <li key={spec.path} className={`folder  ${isExpanded ? 'folder-expanded' : 'folder-collapsed'}`}>
        <div>
          <div onClick={this._selectSpecFolder(spec)}>
            <i className={`folder-collapse-icon fa fa-fw ${isExpanded ? 'fa-caret-down' : 'fa-caret-right'}`}></i>
            <i className={`fa fa-fw ${isExpanded ? 'fa-folder-open-o' : 'fa-folder-o'}`}></i>
            <div className='folder-display-name'>{spec.displayName}{' '}</div>
          </div>
          {
            isExpanded ?
              <div>
                <ul className='list-as-table'>
                  {_.map(spec.children.specs, (spec) => (
                    this._specItem(spec)
                  ))}
                </ul>
              </div> :
              null
          }
        </div>
      </li>
    )
  }

  _specContent (spec) {
    const isChosen = specsStore.isChosenSpec(spec)
    return (
      <li key={spec.path} className='file'>
        <a href='#' onClick={this._selectSpec(spec.path)} className={cs({ active: isChosen })}>
          <div>
            <div>
              <i className={`fa fa-fw ${this._specIcon(isChosen)}`}></i>
              {spec.displayName}
            </div>
          </div>
          <div>
            <div></div>
          </div>
        </a>
      </li>
    )
  }

  _empty () {
    return (
      <div id='tests-list-page'>
        <div className='empty-well'>
          <h5>
            No files found in
            <code onClick={this._openIntegrationFolder}>
              {this.props.project.integrationFolder}
            </code>
          </h5>
          <a className='helper-docs-link' onClick={this._openHelp}>
            <i className='fa fa-question-circle'></i>{' '}
              Need help?
          </a>
        </div>
      </div>
    )
  }

  _openIntegrationFolder = () => {
    ipc.openFinder(this.props.project.integrationFolder)
  }

  _openHelp (e) {
    e.preventDefault()
    ipc.externalOpen('https://on.cypress.io/writing-first-test')
  }
}

export default Specs
