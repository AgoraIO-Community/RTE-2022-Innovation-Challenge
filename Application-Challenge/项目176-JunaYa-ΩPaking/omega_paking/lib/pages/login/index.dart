import 'dart:async';

import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/_internal/utils/form.dart';
import 'package:omega_paking/commands/auth_command.dart';
import 'package:omega_paking/models/auth_model.dart';
import 'package:omega_paking/pages/home/index.dart';
import 'package:omega_paking/services/auth.dart';
import 'package:omega_paking/styles.dart';
import 'package:omega_paking/themes.dart';
import 'package:provider/provider.dart';

class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  @override
  void initState() {
    super.initState();
    authModel = context.read<AuthModel>();
  }

  late AuthModel authModel;


  bool _isRegister = false;
  bool get isRegister => _isRegister;
  set isRegister(bool value) => setState(() => _isRegister = value);

  bool _isValidEmail = false;
  bool get isValidEmail => _isValidEmail;
  set isValidEmail(bool value) => setState(() => _isValidEmail = value);
  
  bool _isValidPassword = false;
  bool get isValidPassword => _isValidPassword;
  set isValidPassword(bool value) => setState(() => _isValidPassword = value);

  String _nickname = "";
  String get nickname => _nickname;
  set nickname(value) => setState(() => _nickname = value);
  String _email = "";
  String get email => _email;
  set email(value) => setState(() => _email = value);
  String _password = "";
  String get password => _password;
  set password(value) => setState(() => _password = value);

  @override
  Widget build(BuildContext context) {
    return Provider.value(value: this, child: _LoginPageStateView());
  }
}

class _LoginPageStateView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    _LoginPageState state = context.watch();
    AppTheme theme = context.watch();

    bool isLoading = false;    

    Future<void> submitRegister() async {
      if (!state.isValidEmail) {
        return;
      }
      if (!state.isValidPassword) {
        return;
      }
      isLoading = true;
      var result = await AuthTokensCommand(context).register(state.nickname, state.email, state.password);
      print("result ===== $result");
      print(state.authModel);
      isLoading = false;
      if (result) {
        Navigator.push<void>(context, PageRoutes.fade(() => HomePage(), Durations.slow.inMilliseconds * .001));
      }
    }

    Future<void> submitLogin() async {
      if (!state.isValidEmail) {
        return;
      }
      if (!state.isValidPassword) {
        return;
      }
      isLoading = true;
      var result = await AuthTokensCommand(context).login(state.email, state.password);
      print("login result ===== $result");
      print(state.authModel.accessToken);
      isLoading = false;
      if (result) {
        Navigator.push<void>(context, PageRoutes.fade(() => HomePage(), Durations.slow.inMilliseconds * .001));
      }
    }

    void _toggleForm() {
      state.isRegister = !state.isRegister;
    }

    Widget _header() {
      return Expanded(
        flex: 2,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 36.0, horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [
              Text(
                "Paking",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 42.0,
                  fontWeight: FontWeight.w800,
                ),
              ),
              SizedBox(
                height: 5.0,
              ),
              Text(
                "Welcome to OmegaPaking",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20.0,
                  fontWeight: FontWeight.w400,
                ),
              )
            ],
          ),
        ),
      );
    }

    Widget _formNickname() {
      return TextField(
        keyboardType: TextInputType.text,
        decoration: InputDecoration(
          filled: true,
          fillColor: theme.bg2,
          hintText: "nickname",
          prefixIcon: Icon(
            Icons.person,
            color: Colors.grey[600],
          ),
          border: OutlineInputBorder(
            borderSide: BorderSide.none,
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
        onChanged: (String value) {
          print(value);
          state.nickname = value;
        },
      );
    }

    Widget _formEmail() {
      return Column(children: [
        TextField(
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(
            filled: true,
            fillColor: theme.bg2,
            hintText: "Email",
            prefixIcon: Icon(
              Icons.mail,
              color: Colors.grey[600],
            ),
            border: OutlineInputBorder(
              borderSide: BorderSide.none,
              borderRadius: BorderRadius.circular(8.0),
            ),
          ),
          onChanged: (String value) {
            state.email = value;
            state.isValidEmail = FormUtils.isValidEmail(value);
          },
        ),
        if (state.isValidEmail) const SizedBox.shrink() else const Text(
          "Please enter a valid email",
          style: TextStyle(
            color: Colors.red,
            fontSize: 12.0,
          ),
        ),
      ]);
    }
    
    Widget _formPassworld() {
      return Column(
        children: [
          TextField(
            obscureText: true,
            decoration: InputDecoration(
              filled: true,
              fillColor: theme.bg2,
              hintText: "password",
              prefixIcon: Icon(
                Icons.lock,
                color: theme.grey,
              ),
              border: OutlineInputBorder(
                borderSide: BorderSide.none,
                borderRadius: BorderRadius.circular(8.0),
              ),
            ),
            onChanged: (String value) => {
              state.password = value,
              state.isValidPassword = FormUtils.isValidPassword(value),
            },
          ),
          state.isValidPassword ? const SizedBox.shrink() : const Text(
            "Please enter a valid password",
            style: TextStyle(
              color: Colors.red,
              fontSize: 12.0,
            ),
          ),
        ],
      );
    }

    Widget _boardRegister() {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _formNickname(),
          const SizedBox(
            height: 10.0,
          ),
          _formEmail(),
          const SizedBox(
            height: 20.0,
          ),
          _formPassworld(),
          const SizedBox(
            height: 10.0,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Text(
                "Forget password",
                textAlign: TextAlign.end,
                style: TextStyle(
                  color: theme.accentTxt,
                  decoration: TextDecoration.underline,
                ),
              ),
            ],
          ),
          const SizedBox(
            height: 50.0,
          ),
          Container(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () async { submitRegister(); },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 18.0),
                child: Text(
                  "Register",
                  style: TextStyle(
                    color: theme.accentTxt,
                    fontSize: 18.0,
                  ),
                ),
              ),
            ),
          ),
          TextButton(
            style: TextButton.styleFrom(
              textStyle: const TextStyle(fontSize: 16),
            ),
            onPressed: _toggleForm,
            child: const Text('login'),
          ),
        ],
      );
    }

    Widget _boardLogin() {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
        _formEmail(),
        const SizedBox(
          height: 20.0,
        ),
        _formPassworld(),
        const SizedBox(
          height: 50.0,
        ),
        Container(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: () async { submitLogin(); },
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 18.0),
              child: Text(
                "Login",
                style: TextStyle(
                  color: theme.accentTxt,
                  fontSize: 18.0,
                ),
              ),
            ),
          ),
        ),
        TextButton(
          style: TextButton.styleFrom(
            textStyle: const TextStyle(fontSize: 16),
          ),
          onPressed: _toggleForm,
          child: const Text('register'),
        ),
      ],
      );
    }
  
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: SingleChildScrollView(
        child: Container(
          constraints: BoxConstraints(
            maxWidth: MediaQuery.of(context).size.width,
            maxHeight: MediaQuery.of(context).size.height,
          ),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.bg1,
                theme.bg2,
              ],
              begin: Alignment.topLeft,
              end: Alignment.centerRight,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _header(),
              Expanded(
                flex: 5,
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: theme.bg1,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(30.0),
                      topRight: Radius.circular(30.0),
                    )),
                  child:  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: state.isRegister ? _boardRegister() : _boardLogin()
                  ),
                  
                ),
              )
            ],
          ),
        ),
      ),
    );
  

  }
  
  @override
  State<StatefulWidget> createState() {
    // TODO: implement createState
    throw UnimplementedError();
  }
}