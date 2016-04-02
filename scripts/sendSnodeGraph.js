/*
 * You may redistribute this program and/or modify it under the terms of
 * the GNU General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var Crypto = require('crypto');
var fs = require('fs');
var http = require('http');
var querystring = require('querystring');

var numForAscii = [
    99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,
    99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,99,
     0, 1, 2, 3, 4, 5, 6, 7, 8, 9,99,99,99,99,99,99,
    99,99,10,11,12,99,13,14,15,99,16,17,18,19,20,99,
    21,22,23,24,25,26,27,28,29,30,31,99,99,99,99,99,
    99,99,10,11,12,99,13,14,15,99,16,17,18,19,20,99,
    21,22,23,24,25,26,27,28,29,30,31,99,99,99,99,99,
];

// see util/Base32.h
var Base32_decode = function (input) {
  var output = [];
  var outputIndex = 0;
  var inputIndex = 0;
  var nextByte = 0;
  var bits = 0;

  while (inputIndex < input.length) {
    var o = input.charCodeAt(inputIndex);
    if (o & 0x80) { throw new Error(); }
    var b = numForAscii[o];
    inputIndex++;
    if (b > 31) { throw new Error("bad character " + input[inputIndex] + " in " + input); }

    nextByte |= (b << bits);
    bits += 5;

    if (bits >= 8) {
      output[outputIndex] = nextByte & 0xff;
      outputIndex++;
      bits -= 8;
      nextByte >>= 8;
    }
  }

  if (bits >= 5 || nextByte) {
    throw new Error("bits is " + bits + " and nextByte is " + nextByte);
  }

  return new Buffer(output);
};

var convert = function (pubKey) {
  if (pubKey.substring(pubKey.length-2) !== ".k") { throw new Error("key does not end with .k"); }
  keyBytes = Base32_decode(pubKey.substring(0, pubKey.length-2));
  //console.log(keyBytes.toString('hex'));
  var hashOneBuff = new Buffer(Crypto.createHash('sha512').update(keyBytes).digest('hex'), 'hex');
  var hashTwo = Crypto.createHash('sha512').update(hashOneBuff).digest('hex');
  var first16 = hashTwo.substring(0,32);
  var out = [];
  for (var i = 0; i < 8; i++) {
    out.push(first16.substring(i*4, i*4+4));
  }
  return out.join(':');
};


var res = {version: 2, mail: "snodegen@auto", data: {nodes: [], edges: []}};

fs.readFile('data', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  data.split("\n").forEach(function(e){
    try{
      var entry = JSON.parse(e);
      if(entry[0] == "node") {
        res.data.nodes.push({ip: convert(entry[2]), version: entry[1].substring(1)});
      } else if(entry[0] == "link") {
        res.data.edges.push({a: convert(entry[1]), b: convert(entry[3])});
      }
    }catch(e){
      console.error("ex");
    }
  });
  
  console.log(res.data.nodes.length + " nodes, " + res.data.edges.length + " edges");

  res.data = JSON.stringify(res.data);

  var data = querystring.stringify(res);

  var post_options = {
    host: 'fc02:2735:e595:bb70:8ffc:5293:8af8:c4b7',
    port: '3000',
    path: '/sendGraph',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  var req = http.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      console.log('result: ' + chunk);
    });
  });

  req.write(data);
  req.end();
});

