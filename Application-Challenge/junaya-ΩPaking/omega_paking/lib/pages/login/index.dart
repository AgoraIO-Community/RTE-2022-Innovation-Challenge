import 'package:flutter/material.dart';
import 'package:omega_paking/_internal/page_routes.dart';
import 'package:omega_paking/_internal/utils/form.dart';
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
  }

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

    String email = "";
    String password = "";
    bool isLoading = false;
    bool isValidEmail = false;
    bool isValidPassword = false;

    Future<void> submit() async {
      print(email);
      print(password);
      print(isValidEmail);
      print(isValidPassword);
      if (!isValidEmail) {
        return;
      }
      if (!isValidPassword) {
        return;
      }
      isLoading = true;
      await AuthService().login(email: email, password: password);
      isLoading = false;
      Navigator.push<void>(context, PageRoutes.fade(() => HomePage(), Durations.slow.inMilliseconds * .001));
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
              Expanded(
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
              ),
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
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
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
                            print(value);
                            email = value;
                            isValidEmail = FormUtils.isValidEmail(value);
                            print(isValidEmail);
                          },
                        ),
                        isValidEmail ? SizedBox.shrink() : Text(
                          "Please enter a valid email",
                          style: TextStyle(
                            color: Colors.red,
                            fontSize: 12.0,
                          ),
                        ),
                        const SizedBox(
                          height: 20.0,
                        ),
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
                            password = value,
                            isValidPassword = FormUtils.isValidPassword(value),
                          },
                        ),
                        isValidPassword ? SizedBox.shrink() : Text(
                          "Please enter a valid password",
                          style: TextStyle(
                            color: Colors.red,
                            fontSize: 12.0,
                          ),
                        ),
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
                            onPressed: () async { submit(); },
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
                      ],
                    ),
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}