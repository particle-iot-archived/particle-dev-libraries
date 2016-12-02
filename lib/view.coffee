{Disposable, CompositeDisposable} = require 'atom'
{View} = require 'atom-space-pen-views'
$ = null
$$ = null
whenjs = require 'when'
SettingsHelper = null
Subscriber = null
spark = null
particleDev = null

module.exports =
class CloudVariablesView extends View
  @content: ->
    @div id: 'particle-dev-cloud-variables-container', =>
      @div id: 'particle-dev-cloud-variables', outlet: 'variablesList'

  initialize: (serializeState, mainModule) ->
    particleDev = mainModule

  setup: ->
    {$, $$} = require 'atom-space-pen-views'

    SettingsHelper = particleDev.SettingsHelper
    spark = require 'spark'
    spark.login { accessToken: SettingsHelper.get('access_token') }



    @disposables = new CompositeDisposable

    @disposables.add atom.commands.add 'atom-workspace',
      'particle-dev:update-core-status': =>
        # Show some progress when core's status is downloaded
        @variablesList.empty()
        @addClass 'loading'
      'particle-dev:core-status-updated': =>
        # Refresh UI and watchers when current core changes
        @listVariables()
        @clearWatchers()
        @removeClass 'loading'
      'particle-dev:logout': =>
        # Clear watchers and hide when user logs out
        @clearWatchers()
        @close()

    @watchers = {}
    @variablePromises = {}

    @listVariables()

    @

  serialize: ->

  destroy: ->
    if @hasParent()
      @remove()
    @disposables?.dispose()

  getTitle: ->
    'Cloud variables'

  # TODO: Remove both of these post 1.0
  onDidChangeTitle: (callback) -> new Disposable()
  onDidChangeModified: (callback) -> new Disposable()

  getPath: ->
    'cloud-variables'

  getUri: ->
    'particle-dev://editor/' + @getPath()

  close: ->
    pane = atom.workspace.paneForUri @getUri()
    pane?.destroy()

  # Propagate table with variables
  listVariables: ->
    variables = SettingsHelper.getLocal 'variables'
    @variablesList.empty()

    if !variables || Object.keys(variables).length == 0
      @variablesList.append $$ ->
        @ul class: 'background-message', =>
          @li 'No variables registered'
    else
      table = $$ ->
        @table =>
          @thead =>
            @tr =>
              @th 'Name'
              @th 'Type'
              @th 'Value'
              @th 'Refresh'
              @th 'Watch'
          @tbody =>
            @raw ''

      for variable in Object.keys(variables)
        row = $$ ->
          @table =>
            @tr 'data-id': variable, =>
              @td variable
              @td variables[variable]
              @td class: 'loading'
              @td =>
                @button class: 'btn btn-sm icon icon-sync'
              @td =>
                @button class: 'btn btn-sm icon icon-eye'

        row.find('td:eq(3) button').on 'click', (event) =>
          @refreshVariable $(event.currentTarget).parent().parent().attr('data-id')

        row.find('td:eq(4) button').on 'click', (event) =>
          @toggleWatchVariable $(event.currentTarget).parent().parent().attr('data-id')

        table.find('tbody').append row.find('tbody >')

      @variablesList.append table

      # Get initial values
      for variable in Object.keys(variables)
        @refreshVariable variable

  # Get variable value from the cloud
  refreshVariable: (variableName) ->
    dfd = whenjs.defer()

    cell = @find('#particle-dev-cloud-variables [data-id=' + variableName + '] td:eq(2)')
    cell.addClass 'loading'
    cell.text ''
    promise = @variablePromises[variableName]
    if !!promise
      promise._handler.resolve()
    promise = spark.getVariable SettingsHelper.getLocal('current_core'), variableName
    @variablePromises[variableName] = promise
    promise.done (e) =>
      if !e
        dfd.resolve null
        return

      delete @variablePromises[variableName]
      cell.removeClass()

      if !!e.ok
        cell.addClass 'icon icon-issue-opened text-error'
        dfd.reject()
      else
        cell.text e.result
        dfd.resolve e.result
    , (e) =>
      delete @variablePromises[variableName]
      cell.removeClass()
      cell.addClass 'icon icon-issue-opened text-error'
      dfd.reject()
    dfd.promise

  # Toggle watching variable
  toggleWatchVariable: (variableName) ->
    row = @find('#particle-dev-cloud-variables [data-id=' + variableName + ']')
    watchButton = row.find('td:eq(4) button')
    refreshButton = row.find('td:eq(3) button')
    valueCell = row.find('td:eq(2)')

    if watchButton.hasClass 'selected'
      watchButton.removeClass 'selected'
      refreshButton.removeAttr 'disabled'
      clearInterval @watchers[variableName]
      delete @watchers[variableName]
    else
      watchButton.addClass 'selected'
      refreshButton.attr 'disabled', 'disabled'
      # Gget variable every 5 seconds (empirical value)
      @watchers[variableName] = setInterval =>
        @refreshVariable variableName
      , 5000

  # Remove all variable watchers
  clearWatchers: ->
    for key in Object.keys(@watchers)
      clearInterval @watchers[key]
    @watchers = {}
