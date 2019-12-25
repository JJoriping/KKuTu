// Rule the words! KKuTu Online
// Copyright (C) 2020  JJoriping(op@jjo.kr)
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const FS = require("fs");
const Path = require("path");
const SchemaGenerator = require("ts-json-schema-generator");

const NAME = process.argv[2];
if(!NAME){
  console.info("Usage: node tools/schema.js NAME");
  process.exit();
}

const type = `Schema.${NAME}`;
const target = Path.resolve(__dirname, "../data", `${NAME.toLowerCase()}.schema.json`);

FS.writeFile(
  target,
  JSON.stringify(SchemaGenerator.createGenerator({
    path: Path.resolve(__dirname, "../src/common/schema.d.ts"),
    type,
    jsDoc: "extended"
  }).createSchema(type), null, 2),
  err => {
    if(err){
      throw err;
    }
    console.info("File generated:", target);
  }
);