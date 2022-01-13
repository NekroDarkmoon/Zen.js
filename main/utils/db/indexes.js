// ----------------------------------------------------------------
//                             Tags Indexes
// ----------------------------------------------------------------
let tagsIndex =
	'CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON tags USING GIN (name gin_trgm_ops);\n';
tagsIndex +=
	'CREATE INDEX IF NOT EXISTS tags_name_lower_idx ON tags (LOWER(name));\n';
tagsIndex +=
	'CREATE UNIQUE INDEX IF NOT EXISTS tags_uniq_idx ON tags (LOWER(name), server_id);\n';

// ----------------------------------------------------------------
//                           Tags_lookup Indexes
// ----------------------------------------------------------------
let tag_lookup =
	'CREATE INDEX IF NOT EXISTS tag_lookup_name_trgm_idx ON tag_lookup USING GIN (name gin_trgm_ops);\n';
tag_lookup +=
	'CREATE INDEX IF NOT EXISTS tag_lookup_name_lower_idx ON tag_lookup (LOWER(name));\n';
tag_lookup +=
	'CREATE UNIQUE INDEX IF NOT EXISTS tag_lookup_uniq_idx ON tag_lookup (LOWER(name), server_id);';

// ----------------------------------------------------------------
//                                Export
// ----------------------------------------------------------------
const indexes = [tagsIndex, tag_lookup];
export default indexes;
