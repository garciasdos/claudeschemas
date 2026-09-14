type SchemaNode = Record<string, unknown>

const asNode = (value: unknown): SchemaNode | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as SchemaNode)
    : null

const withArticle = (noun: string): string => `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`

const resolvePointer = (root: SchemaNode, pointer: string): SchemaNode | null => {
  if (!pointer.startsWith('#/')) {
    return null
  }
  let current: SchemaNode | null = root
  for (const segment of pointer.slice(2).split('/')) {
    if (current === null) {
      return null
    }
    current = asNode(current[segment])
  }
  return current
}

const describeType = (root: SchemaNode, node: SchemaNode, type: string): string | null => {
  if (type === 'array') {
    const items = describeSchemaNode(root, node.items)
    return items === null ? 'a list' : `a list of ${items.replace(/^an? /, '')}s`
  }
  if (type === 'object') {
    return 'an object'
  }
  if (type === 'string' || type === 'boolean') {
    return withArticle(type)
  }
  if (type === 'number' || type === 'integer') {
    return 'a number'
  }
  return null
}

export const describeSchemaNode = (root: SchemaNode, value: unknown): string | null => {
  const node = asNode(value)
  if (node === null) {
    return null
  }
  if (typeof node.$ref === 'string') {
    return describeSchemaNode(root, resolvePointer(root, node.$ref))
  }
  if (Array.isArray(node.allOf) && node.allOf.length === 1) {
    return describeSchemaNode(root, node.allOf[0])
  }
  if (typeof node.title === 'string') {
    return withArticle(node.title)
  }
  if (Array.isArray(node.enum)) {
    return node.enum.length === 1
      ? `"${String(node.enum[0])}"`
      : `one of: ${node.enum.map((entry) => String(entry)).join(', ')}`
  }
  const branches = node.anyOf ?? node.oneOf
  if (Array.isArray(branches)) {
    const described = branches
      .map((branch) => describeSchemaNode(root, branch))
      .filter((entry): entry is string => entry !== null)
    return described.length === 0 ? null : Array.from(new Set(described)).join(' or ')
  }
  if (typeof node.type === 'string') {
    return describeType(root, node, node.type)
  }
  return null
}

export const describeProperty = (
  root: SchemaNode,
  path: readonly (string | number)[],
): string | null => {
  const head = path[0]
  if (head === undefined || path.length !== 1) {
    return null
  }
  const properties = asNode(root.properties)
  if (properties === null) {
    return null
  }
  return describeSchemaNode(root, properties[String(head)])
}
